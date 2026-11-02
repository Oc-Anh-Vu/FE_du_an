import { MotionConfig } from "framer-motion"
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import {
  Compass,
  Home as HomeIcon,
  Settings2,
  UsersRound,
  WalletCards,
} from "lucide-react"
import { MainLayout, type NavItemConfig, PublicLayout } from "./components/layout"
import { Toast } from "./components/ui/feedback/Toast"
import {
  AdminRoute,
  GuestOnlyRoute,
  ProtectedRoute,
  SessionBootstrap,
} from "./features/auth"
import InvitePopup from "./features/social/InvitePopup"
import { resetSessionAndStores, useUserStore } from "./store/userStore"
import { useUIStore } from "./store/uiStore"

// Pages
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import Verify from "./pages/auth/Verify"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import Dashboard from "./pages/app/Dashboard"
import Explore from "./pages/app/Explore"
import Friends from "./pages/app/Friends"
import Billing from "./pages/app/Billing"
import Profile from "./pages/app/Profile"
import RoomHome from "./pages/app/room/RoomHome"
import RoomNew from "./pages/app/room/RoomNew"
import Join from "./pages/app/room/Join"
import Match from "./pages/app/room/Match"
import MatchmakingQueue from "./pages/app/room/MatchmakingQueue"
import Lobby from "./pages/app/room/Lobby"
import Swipe from "./pages/app/room/Swipe"
import Summary from "./pages/app/room/Summary"
import AdminDashboard from "./pages/admin/AdminDashboard"
import UsersManagement from "./pages/admin/UsersManagement"
import PlacesManagement from "./pages/admin/PlacesManagement"
import TagsManagement from "./pages/admin/TagsManagement"

const userNavItems: NavItemConfig[] = [
  { key: "home", label: "Trang chủ", icon: <HomeIcon aria-hidden="true" size={20} /> },
  { key: "explore", label: "Khám phá", icon: <Compass aria-hidden="true" size={20} /> },
  { key: "friends", label: "Hội ăn", icon: <UsersRound aria-hidden="true" size={20} /> },
  { key: "billing", label: "Tài chính", icon: <WalletCards aria-hidden="true" size={20} /> },
]

const adminNavItems: NavItemConfig[] = [
  { key: "overview", label: "Tổng quan", icon: <HomeIcon aria-hidden="true" size={20} /> },
  { key: "users", label: "Người dùng", icon: <UsersRound aria-hidden="true" size={20} /> },
  { key: "places", label: "Địa điểm", icon: <Compass aria-hidden="true" size={20} /> },
  { key: "tags", label: "Tags hệ thống", icon: <Settings2 aria-hidden="true" size={20} /> },
]

function WorkspaceLayout({ kind }: { kind: "user" | "admin" }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = kind === "admin"
  const navItems = isAdmin ? adminNavItems : userNavItems
  const currentUser = useUserStore((state) => state.currentUser)
  const userRoles = currentUser?.roles ?? []
  const hasAdminRole = userRoles.includes("ADMIN") || userRoles.includes("ROLE_ADMIN")

  const activeKey = isAdmin
    ? pathname.startsWith("/admin/users")
      ? "users"
      : pathname.startsWith("/admin/places")
        ? "places"
        : pathname.startsWith("/admin/tags")
          ? "tags"
          : "overview"
    : pathname.startsWith("/app/explore")
      ? "explore"
      : pathname.startsWith("/app/friends")
        ? "friends"
        : pathname.startsWith("/app/billing")
          ? "billing"
          : "home"

  const destinations: Record<string, string> = isAdmin
    ? {
        overview: "/admin",
        users: "/admin/users",
        places: "/admin/places",
        tags: "/admin/tags",
      }
    : {
        home: "/app",
        explore: "/app/explore",
        friends: "/app/friends",
        billing: "/app/billing",
      }

  return (
    <MainLayout
      brandName={isAdmin ? "HNAG Admin" : "Hôm nay ăn gì"}
      brandHref={isAdmin ? "/admin" : "/app"}
      navItems={navItems}
      activeKey={activeKey}
      onBrandClick={() => navigate(isAdmin ? "/admin" : "/app")}
      onSelectNav={(key) => navigate(destinations[key] ?? (isAdmin ? "/admin" : "/app"))}
      userProfile={{
        name: currentUser?.username || (isAdmin ? "Quản trị viên" : "Người dùng"),
        subtitle: hasAdminRole ? "Quản trị viên" : "Thành viên",
        avatarUrl: currentUser?.avatarUrl ?? undefined,
        onClick: () => navigate("/app/profile"),
      }}
      onLogout={() => {
        void resetSessionAndStores()
        navigate("/login", { replace: true })
      }}
      sidebarPromo={
        <Link
          className="focus-ring block rounded-panel bg-surface-dark p-4 text-sm font-semibold text-surface-dark-foreground"
          to={isAdmin ? "/app" : "/app/room"}
        >
          {isAdmin ? "Mở khu vực người dùng" : "Tạo phòng, rủ hội đi ăn"}
        </Link>
      }
    >
      <Outlet />
    </MainLayout>
  )
}

function PublicRouteWrapper() {
  const authStatus = useUserStore((state) => state.authStatus)
  const isAuthenticated = authStatus === "AUTHENTICATED"

  return (
    <PublicLayout
      isAuthenticated={isAuthenticated}
      renderLink={(href, children, className) => (
        <Link className={className} to={href}>
          {children}
        </Link>
      )}
    >
      <Outlet />
    </PublicLayout>
  )
}

function AppToast() {
  const toast = useUIStore((state) => state.toast)
  const hideToast = useUIStore((state) => state.hideToast)

  return (
    <div className="fixed bottom-4 right-4 z-toast flex max-w-sm flex-col gap-2">
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
        duration={toast.duration}
      />
    </div>
  )
}

function AppInvitePopup() {
  const navigate = useNavigate()

  return (
    <InvitePopup
      onAcceptInvite={(_roomId, roomCode) => {
        navigate(`/app/room/join?code=${encodeURIComponent(roomCode)}`)
      }}
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Nhóm Route công khai (PublicLayout) */}
      <Route element={<PublicRouteWrapper />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Nhóm Route xác thực (GuestOnlyRoute - chỉ dành cho khách chưa đăng nhập) */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* 3. Nhóm Route người dùng (ProtectedRoute - yêu cầu đăng nhập) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<WorkspaceLayout kind="user" />}>
          <Route index element={<Dashboard />} />
          <Route path="explore" element={<Explore />} />
          <Route path="friends" element={<Friends />} />
          <Route path="billing" element={<Billing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="room">
            <Route index element={<RoomHome />} />
            <Route path="new" element={<RoomNew />} />
            <Route path="join" element={<Join />} />
            <Route path="match" element={<Match />} />
            <Route path="queue" element={<MatchmakingQueue />} />
            <Route path=":id">
              <Route index element={<Navigate replace to="lobby" />} />
              <Route path="lobby" element={<Lobby />} />
              <Route path="swipe" element={<Swipe />} />
              <Route path="summary" element={<Summary />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* 4. Nhóm Route quản trị (AdminRoute - yêu cầu quyền ADMIN) */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<WorkspaceLayout kind="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="places" element={<PlacesManagement />} />
          <Route path="tags" element={<TagsManagement />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SessionBootstrap>
          <AppRoutes />
          <AppToast />
          <AppInvitePopup />
        </SessionBootstrap>
      </BrowserRouter>
    </MotionConfig>
  )
}
