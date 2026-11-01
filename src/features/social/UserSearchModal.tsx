import { useEffect, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import type { UserResponse } from "../../types/api";
import { Avatar } from "../../components/ui/display/Avatar";
import { Button } from "../../components/ui/form/Button";
import { Modal } from "../../components/ui/feedback/Modal";
import { SearchInput } from "../../components/ui/form/SearchInput";
import { Spinner } from "../../components/ui/feedback/Spinner";

export interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchUsers: (query: string) => Promise<UserResponse[]>;
  onSendRequest: (userId: string) => Promise<void>;
  currentUserId?: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function isAdmin(user: UserResponse): boolean {
  return user.roles.some((role) => role === "ROLE_ADMIN" || role === "ADMIN");
}

export default function UserSearchModal({
  isOpen,
  onClose,
  searchUsers,
  onSendRequest,
  currentUserId,
}: UserSearchModalProps) {
  const [query, setQuery] = useState("");
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
    if (!isOpen) searchSequence.current += 1;
  }, [isOpen]);

  function handleClose() {
    if (requestInProgress.current) return;
    searchSequence.current += 1;
    setQuery("");
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
      setSearchError("Nhập tên người dùng hoặc UUID để tìm kiếm.");
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
      if (sequence === searchSequence.current) setIsSearching(false);
    }
  }

  async function handleSendRequest(userId: string) {
    if (requestInProgress.current) return;

    requestInProgress.current = true;
    setSendingUserId(userId);
    setRequestError(null);
    try {
      await onSendRequest(userId);
      setSentUserIds((currentIds) => new Set(currentIds).add(userId));
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      requestInProgress.current = false;
      setSendingUserId(null);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tìm bạn mới"
      description="Tìm theo tên người dùng hoặc nhập UUID nếu không tìm thấy."
      size="md"
    >
      <form className="space-y-3" onSubmit={(event) => void handleSearch(event)}>
        <SearchInput
          label="Tên người dùng hoặc UUID"
          placeholder="Ví dụ: nguyenvana"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => {
            setQuery("");
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
          loadingText="Đang tìm..."
        >
          Tìm kiếm
        </Button>
      </form>

      {searchError && (
        <p role="alert" className="mt-4 text-body-sm text-danger">
          {searchError}
        </p>
      )}
      {requestError && (
        <p role="alert" className="mt-4 text-body-sm text-danger">
          {requestError}
        </p>
      )}

      <div className="mt-4" aria-live="polite">
        {isSearching ? (
          <div className="flex justify-center py-6">
            <Spinner label="Đang tìm người dùng" />
          </div>
        ) : hasSearched && users.length === 0 && !searchError ? (
          <p className="py-6 text-center text-body-sm text-muted-foreground">
            Không tìm thấy người dùng phù hợp.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isAdminAccount = isAdmin(user);
              const isSent = sentUserIds.has(user.id);
              const isSending = sendingUserId === user.id;

              return (
                <li
                  key={user.id}
                  className="flex items-center gap-3 py-3"
                >
                  <Avatar
                    src={user.avatarUrl ?? undefined}
                    name={user.username}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-foreground">
                      {user.username}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {user.id}
                    </p>
                    {(isSelf || isAdminAccount) && (
                      <p className="text-caption text-muted-foreground">
                        {isSelf ? "Đây là tài khoản của bạn" : "Không thể kết bạn với tài khoản này"}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isSent ? "outline" : "primary"}
                    leftIcon={
                      !isSent ? <UserPlus aria-hidden="true" size={16} /> : undefined
                    }
                    disabled={isSelf || isAdminAccount || isSent || sendingUserId !== null}
                    loading={isSending}
                    loadingText="Đang gửi..."
                    onClick={() => void handleSendRequest(user.id)}
                  >
                    {isSent ? "Đã gửi" : "Kết bạn"}
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
