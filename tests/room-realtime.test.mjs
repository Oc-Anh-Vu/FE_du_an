import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { createStore } from 'zustand/vanilla';

// Run the real TypeScript modules against controlled transport/HTTP/hook boundaries.
// This suite requires neither a live backend nor additional test dependencies.
function loadSource(path, mocks, globals = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source.replaceAll('import.meta.env', '__env'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, AbortController, __env: { VITE_ENABLE_WS: 'true' },
    require(name) {
      assert.ok(name in mocks, `Missing mock for ${name} in ${path}`);
      return mocks[name];
    },
    ...globals,
  }, { filename: path });
  return exports;
}

// Minimal lifecycle driver: preserves refs/state and runs effect cleanup on changes.
// It lets tests exercise hook callbacks without installing a DOM renderer.
function hookDriver() {
  const slots = [];
  let index = 0;
  let dirty = false;
  let pending = [];
  let renderFn;
  let result;
  function memo(factory, deps) {
    const i = index++;
    const previous = slots[i];
    if (!previous || deps.some((dep, j) => !Object.is(dep, previous.deps[j]))) {
      slots[i] = { deps, value: factory() };
    }
    return slots[i].value;
  }
  const react = {
    useCallback: (callback, deps) => memo(() => callback, deps),
    useMemo: memo,
    useRef(initial) {
      const i = index++;
      slots[i] ??= { current: initial };
      return slots[i];
    },
    useState(initial) {
      const i = index++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], (next) => {
        const value = typeof next === 'function' ? next(slots[i]) : next;
        if (!Object.is(value, slots[i])) dirty = true;
        slots[i] = value;
      }];
    },
    useEffect(effect, deps) {
      const i = index++;
      const previous = slots[i];
      if (!previous || deps.some((dep, j) => !Object.is(dep, previous.deps[j]))) {
        pending.push(() => {
          previous?.cleanup?.();
          slots[i] = { deps, cleanup: effect() };
        });
      }
    },
  };
  return {
    react,
    render(fn = renderFn) {
      renderFn = fn;
      let renders = 0;
      do {
        assert.ok(renders++ < 20, 'Unexpected render loop');
        dirty = false;
        index = 0;
        pending = [];
        result = renderFn();
        pending.forEach((effect) => effect());
      } while (dirty);
      return result;
    },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function socketFixture() {
  const clients = [];
  const log = [];
  class Client {
    constructor(options) { this.options = options; clients.push(this); }
    activate() { this.active = true; }
    deactivate() { this.active = false; }
    subscribe(destination) {
      log.push(`subscribe:${destination}`);
      return { unsubscribe: () => log.push(`unsubscribe:${destination}`) };
    }
    open() { this.connected = true; this.options.onConnect(); }
    close() { this.connected = false; this.options.onWebSocketClose(); }
  }
  const intervals = new Map();
  let timerId = 0;
  const window = {
    setInterval: (callback) => { intervals.set(++timerId, callback); return timerId; },
    clearInterval: (id) => intervals.delete(id),
    setTimeout: () => ++timerId,
    clearTimeout: () => {},
  };
  const { socketClient } = loadSource('src/services/socketClient.ts', {
    '@stomp/stompjs': { Client },
    'sockjs-client': function SockJS() {},
    './apiClient': { API_BASE_URL: 'http://test', getAccessToken: () => null },
  }, { window });
  function mount(options) {
    const driver = hookDriver();
    const { useSocket } = loadSource('src/hooks/useSocket.ts', {
      react: driver.react, '../services/socketClient': { socketClient },
    }, { window });
    return { ...driver, render: (next = options) => driver.render(() => useSocket(next)) };
  }
  return { socketClient, clients, log, intervals, mount };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test('unexpected close without onWebSocketError starts REST fallback', async () => {
  const fixture = socketFixture();
  let polls = 0;
  const hook = fixture.mount({ roomId: 'A', onPoll: () => { polls++; } });
  assert.equal(hook.render().isPolling, true);
  fixture.clients[0].open();
  assert.equal(hook.render().isConnected, true);
  assert.equal(fixture.intervals.size, 0);
  await settle();
  fixture.clients[0].close();
  assert.equal(hook.render().isConnected, false);
  assert.equal(hook.render().isPolling, true);
  assert.equal(fixture.intervals.size, 1);
  fixture.intervals.values().next().value();
  assert.equal(polls, 2);
  hook.unmount();
  assert.equal(fixture.intervals.size, 0);
});

test('Lobby to Swipe reuses singleton and gives Swipe its own connection listener', async () => {
  const fixture = socketFixture();
  let lobbyPolls = 0;
  let swipePolls = 0;
  const lobby = fixture.mount({ roomId: 'A', onPoll: () => { lobbyPolls++; } });
  lobby.render();
  fixture.clients[0].open();
  await settle();
  lobby.unmount();
  const swipe = fixture.mount({ roomId: 'A', onPoll: () => { swipePolls++; } });
  assert.equal(swipe.render().isConnected, true);
  assert.equal(fixture.clients.length, 1);
  await settle();
  fixture.clients[0].close();
  assert.equal(swipe.render().isPolling, true);
  fixture.clients[0].open();
  assert.equal(swipe.render().isConnected, true);
  assert.equal(lobbyPolls, 1);
  assert.equal(swipePolls, 2);
  swipe.unmount();
});

test('every successful connect resubscribes before REST synchronization', async () => {
  const fixture = socketFixture();
  const hook = fixture.mount({ roomId: 'A', onPoll: () => fixture.log.push('REST') });
  hook.render();
  fixture.clients[0].open();
  await settle();
  fixture.clients[0].close();
  fixture.clients[0].open();
  await settle();
  assert.deepEqual(fixture.log, ['subscribe:/topic/rooms/A', 'REST', 'subscribe:/topic/rooms/A', 'REST']);
  hook.unmount();
});

test('reconnect during an in-flight poll schedules a fresh REST read without overlap', async () => {
  const fixture = socketFixture();
  let release;
  let polls = 0;
  const hook = fixture.mount({ roomId: 'A', onPoll: () => {
    polls++;
    if (polls === 1) return new Promise((resolve) => { release = resolve; });
  } });
  hook.render();
  fixture.clients[0].open();
  fixture.clients[0].close();
  fixture.clients[0].open();
  assert.equal(polls, 1);
  release();
  await settle();
  assert.equal(polls, 2);
  hook.unmount();
});

test('ending a room detaches its subscription/listener and stops polling', () => {
  const fixture = socketFixture();
  const onPoll = () => {};
  const hook = fixture.mount({ roomId: 'A', onPoll });
  hook.render();
  assert.equal(fixture.intervals.size, 1);
  const result = hook.render({ roomId: 'A', onPoll, enabled: false });
  assert.equal(result.isPolling, false);
  assert.equal(fixture.intervals.size, 0);
  fixture.clients[0].open();
  assert.deepEqual(fixture.log, []);
  assert.equal(fixture.clients[0].active, true);
  hook.unmount();
});

test('late close of a disconnected client cannot mark a new connection as closed', () => {
  const { socketClient, clients } = socketFixture();
  socketClient.connect();
  clients[0].open();
  socketClient.disconnect();
  socketClient.connect();
  clients[1].open();
  clients[0].close();
  assert.equal(socketClient.isConnected(), true);
});

const types = loadSource('src/types/api.ts', {});
const access = loadSource('src/features/room/roomAccess.ts', { '../../types': types });

test('membership and HTTP access failures are distinguished from network/server errors', () => {
  for (const error of [{ code: 2001 }, { code: 2007 }, { status: 403 }, { status: 404 }]) {
    assert.equal(access.isRoomAccessError(error), true);
  }
  for (const error of [{ status: 500 }, new Error('network'), null]) {
    assert.equal(access.isRoomAccessError(error), false);
  }
});

function roomFixture() {
  const store = createStore(() => ({
    currentRoom: { id: 'A' }, activeRooms: [{ id: 'A' }, { id: 'B' }],
    roomDeck: ['old'], mySwipes: ['old'], swipeResults: ['old'],
    setCurrentRoom: (currentRoom) => store.setState({ currentRoom }),
    setRoomDeck: (roomDeck) => store.setState({ roomDeck }),
    setMySwipes: (mySwipes) => store.setState({ mySwipes }),
  }));
  const useRoomStore = Object.assign((selector) => selector(store.getState()), store);
  const navigateCalls = [];
  const toastCalls = [];
  let expenses = ['old'];
  const driver = hookDriver();
  const { useRoomSession } = loadSource('src/features/room/useRoomSession.ts', {
    react: driver.react,
    'react-router-dom': { useNavigate: () => (path) => navigateCalls.push(path) },
    '../../store/roomStore': { useRoomStore },
    '../../store/billingStore': { useBillingStore: { getState: () => ({ setRoomExpenses: (next) => { expenses = next; } }) } },
    '../../store/uiStore': { useUIStore: { getState: () => ({ showToast: (...args) => toastCalls.push(args) }) } },
  });
  const session = driver.render(() => useRoomSession('A'));
  return { driver, session, useRoomStore, navigateCalls, toastCalls, getExpenses: () => expenses };
}

test('access loss invalidates pending work, clears room data, and redirects exactly once', () => {
  const fixture = roomFixture();
  const signal = fixture.session.getSessionSignal();
  fixture.session.endRoomSession('removed');
  fixture.session.endRoomSession('duplicate');
  assert.equal(signal.aborted, true);
  assert.equal(fixture.session.isSessionActive(), false);
  assert.equal(fixture.driver.render().isRoomSessionEnabled, false);
  const state = fixture.useRoomStore.getState();
  assert.equal(state.currentRoom, null);
  for (const key of ['roomDeck', 'mySwipes', 'swipeResults']) assert.equal(state[key].length, 0);
  assert.equal(state.activeRooms.length, 1);
  assert.equal(state.activeRooms[0].id, 'B');
  assert.equal(fixture.getExpenses().length, 0);
  assert.deepEqual(fixture.navigateCalls, ['/app/room']);
  assert.equal(fixture.toastCalls.length, 1);
  fixture.driver.unmount();
});

test('a pending room response cannot restore a session after a kick', async () => {
  const fixture = roomFixture();
  let resolveRoom;
  const { useRoomActions } = loadSource('src/features/room/useRoomActions.ts', {
    react: hookDriver().react, '../../types': types, './roomAccess': access,
    '../../services/room.service': { roomService: { getRoomById: () => new Promise((resolve) => { resolveRoom = resolve; }) } },
    '../../services/matchmaking.service': { matchmakingService: { cancelMatch: async () => {} } },
    '../../store/roomStore': { useRoomStore: fixture.useRoomStore },
    '../../store/userStore': { useUserStore: (selector) => selector({ currentUser: null }) },
    '../../store/uiStore': {},
  });
  const request = useRoomActions().fetchRoomDetails('A', fixture.session.getSessionSignal());
  fixture.session.endRoomSession();
  resolveRoom({ id: 'A' });
  assert.equal((await request).success, false);
  assert.equal(fixture.useRoomStore.getState().currentRoom, null);
  fixture.driver.unmount();
});

test('Swipe initialization handles access rejection immediately and ignores data arriving after a kick', async () => {
  const fixture = roomFixture();
  let rejectAccess = true;
  let resolveDeck;
  const { useSwipeActions } = loadSource('src/features/swipe/useSwipeActions.ts', {
    react: hookDriver().react, '../../types': types, '../room/roomAccess': access,
    '../../services/room.service': { roomService: {
      getRoomDetails: async () => { if (rejectAccess) throw { status: 403 }; return { id: 'A' }; },
      getRoomDeck: () => new Promise((resolve) => { resolveDeck = resolve; }),
    } },
    '../../services/swipe.service': { swipeService: { getMySwipesInRoom: () => assert.fail('History should not be fetched') } },
    '../../store/roomStore': { useRoomStore: fixture.useRoomStore },
    '../../store/uiStore': {},
  });
  let accessLost = 0;
  const actions = useSwipeActions(() => { accessLost++; });
  await actions.initializeSwipeSession('A');
  assert.equal(accessLost, 1);
  rejectAccess = false;
  const request = actions.initializeSwipeSession('A', fixture.session.getSessionSignal());
  await settle();
  fixture.session.endRoomSession();
  resolveDeck([{ id: 'old-place' }]);
  await request;
  assert.equal(fixture.useRoomStore.getState().roomDeck.length, 0);
  fixture.driver.unmount();
});
