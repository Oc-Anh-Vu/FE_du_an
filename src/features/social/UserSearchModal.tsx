import { useEffect, useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { UserResponse, UUID } from '../../types';
import { Avatar } from '../../components/ui/display/Avatar';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { SearchInput } from '../../components/ui/form/SearchInput';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Alert } from '../../components/ui/feedback/Alert';

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchUsers: (query: string) => Promise<UserResponse[]>;
  onSendRequest: (userId: UUID) => Promise<boolean | void>;
  currentUserId?: UUID;
  isSearchForbidden?: boolean;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tìm kiếm hoặc gửi yêu cầu.';
}

function isAdmin(user: UserResponse): boolean {
  return (user.roles ?? []).some((role) => role === 'ROLE_ADMIN' || role === 'ADMIN');
}

export default function UserSearchModal({
  isOpen,
  onClose,
  searchUsers,
  onSendRequest,
  currentUserId,
  isSearchForbidden = false,
}: UserSearchModalProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sendingUserId, setSendingUserId] = useState<string | null>(null);
  const [sentUserIds, setSentUserIds] = useState<Set<string>>(() => new Set());
  const [requestError, setRequestError] = useState<string | null>(null);
  const searchSequence = useRef(0);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      searchSequence.current += 1;
    }
  }, [isOpen]);

  function handleClose() {
    if (requestInProgress.current) return;
    searchSequence.current += 1;
    setQuery('');
    setUsers([]);
    setHasSearched(false);
    setIsSearching(false);
    setSearchError(null);
    setSendingUserId(null);
    setSentUserIds(new Set());
    setRequestError(null);
    onClose();
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) {
      setSearchError('Vui lòng nhập tên người dùng hoặc mã UUID để tìm kiếm.');
      return;
    }

    const sequence = ++searchSequence.current;
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    setRequestError(null);

    try {
      const results = await searchUsers(searchTerm);
      if (sequence === searchSequence.current) {
        setUsers(results);
      }
    } catch (error) {
      if (sequence === searchSequence.current) {
        setUsers([]);
        setSearchError(getErrorMessage(error));
      }
    } finally {
      if (sequence === searchSequence.current) {
        setIsSearching(false);
      }
    }
  }

  async function handleSendRequest(userId: string) {
    if (requestInProgress.current) return;

    requestInProgress.current = true;
    setSendingUserId(userId);
    setRequestError(null);
    try {
      const res = await onSendRequest(userId);
      if (res !== false) {
        setSentUserIds((currentIds) => new Set(currentIds).add(userId));
      }
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      requestInProgress.current = false;
      setSendingUserId(null);
    }
  }

  const isQueryUuid = UUID_REGEX.test(query.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tìm kiếm & Kết bạn"
      description="Tìm bạn bằng tên tài khoản hoặc dán trực tiếp mã định danh UUID."
      size="md"
    >
      <form className="space-y-4" onSubmit={(event) => void handleSearch(event)}>
        <SearchInput
          label="Tên tài khoản hoặc mã UUID"
          placeholder="Nhập username hoặc UUID (ví dụ: a1b2c3d4-...)"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (searchError) setSearchError(null);
          }}
          onClear={() => {
            setQuery('');
            setUsers([]);
            setHasSearched(false);
            setSearchError(null);
          }}
          autoComplete="off"
        />

        <Button
          type="submit"
          fullWidth
          loading={isSearching}
          loadingText="Đang tìm kiếm..."
        >
          Tìm kiếm
        </Button>
      </form>

      {isSearchForbidden && (
        <div className="mt-4">
          <Alert variant="warning" title="Bảo mật danh bạ người dùng">
            Hệ thống áp dụng chính sách bảo mật không công khai danh bạ chung. Bạn có thể dán trực tiếp mã <strong>UUID (36 ký tự)</strong> của bạn bè vào ô trên để gửi lời mời kết bạn ngay.
          </Alert>
        </div>
      )}

      {searchError && (
        <div className="mt-4">
          <Alert variant="danger">
            {searchError}
          </Alert>
        </div>
      )}

      {requestError && (
        <div className="mt-4">
          <Alert variant="danger">
            {requestError}
          </Alert>
        </div>
      )}

      <div className="mt-4" aria-live="polite">
        {isSearching ? (
          <div className="flex justify-center py-6">
            <Spinner label="Đang tra cứu người dùng..." />
          </div>
        ) : hasSearched && users.length === 0 && !searchError ? (
          <div className="py-6 text-center">
            <p className="text-body-sm text-muted-foreground">
              Không tìm thấy người dùng phù hợp với từ khóa.
            </p>
            {isQueryUuid && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void handleSendRequest(query.trim())}
              >
                Gửi kết bạn trực tiếp tới UUID này
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border bg-card p-2" role="list">
            {users.map((user) => {
              const isSelf = Boolean(currentUserId && user.id === currentUserId);
              const isAdminAccount = isAdmin(user);
              const isSent = sentUserIds.has(user.id);
              const isSending = sendingUserId === user.id;

              return (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/50 rounded-card"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={user.avatarUrl ?? undefined}
                      name={user.username}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-body font-bold text-foreground">
                        {user.username}
                      </p>
                      <p className="truncate text-caption text-muted-foreground font-mono">
                        {user.id}
                      </p>
                      {(isSelf || isAdminAccount) && (
                        <p className="text-caption font-semibold text-warning-soft-foreground">
                          {isSelf
                            ? 'Đây là tài khoản của bạn'
                            : 'Không thể gửi kết bạn cho Quản trị viên'}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isSent ? 'outline' : 'primary'}
                    leftIcon={!isSent ? <UserPlus aria-hidden="true" size={16} /> : undefined}
                    disabled={isSelf || isAdminAccount || isSent || sendingUserId !== null}
                    loading={isSending}
                    loadingText="Đang gửi..."
                    onClick={() => void handleSendRequest(user.id)}
                  >
                    {isSent ? 'Đã gửi' : 'Kết bạn'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
