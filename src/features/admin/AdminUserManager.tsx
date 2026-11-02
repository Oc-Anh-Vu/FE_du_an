import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Shield, Trash2, User } from 'lucide-react';
import type { UUID, UserResponse, UserUpdateRequest } from '../../types';
import { SearchInput } from '../../components/ui/form/SearchInput';
import { Button } from '../../components/ui/form/Button';
import { Input } from '../../components/ui/form/Input';
import { Badge } from '../../components/ui/display/Badge';
import { Avatar } from '../../components/ui/display/Avatar';
import { Modal } from '../../components/ui/feedback/Modal';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface AdminUserManagerProps {
  users?: UserResponse[];
  isLoading?: boolean;
  error?: string | null;
  onUpdateUser?: (userId: UUID, payload: UserUpdateRequest) => Promise<UserResponse | null | void>;
  onDeleteUser?: (userId: UUID) => Promise<boolean | void>;
  onRefresh?: () => Promise<void> | void;
}

function isAdmin(user: UserResponse): boolean {
  return (user.roles ?? []).some((role) => {
    const norm = String(role).trim().toUpperCase();
    return norm === 'ROLE_ADMIN' || norm === 'ADMIN';
  });
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export default function AdminUserManager({
  users = [],
  isLoading = false,
  error = null,
  onUpdateUser,
  onDeleteUser,
  onRefresh,
}: AdminUserManagerProps) {
  const [query, setQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Form states cho Modal chỉnh sửa
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBankBin, setEditBankBin] = useState('');
  const [editBankAccountNumber, setEditBankAccountNumber] = useState('');
  const [editBankAccountName, setEditBankAccountName] = useState('');

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const matchName = u.username.toLowerCase().includes(term);
      const matchEmail = u.email.toLowerCase().includes(term);
      const matchId = u.id.toLowerCase().includes(term);
      const matchRoles = (u.roles ?? []).some((r) => String(r).toLowerCase().includes(term));
      return matchName || matchEmail || matchId || matchRoles;
    });
  }, [query, users]);

  function openEditModal(user: UserResponse) {
    setMutationError(null);
    setEditingUser(user);
    setEditEmail(user.email || '');
    setEditPassword('');
    setEditAvatarUrl(user.avatarUrl || '');
    setEditBankBin(user.bankBin || '');
    setEditBankAccountNumber(user.bankAccountNumber || '');
    setEditBankAccountName(user.bankAccountName || '');
  }

  async function handleSaveUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingUser || !onUpdateUser) return;

    if (editPassword && editPassword.length < 6) {
      setMutationError('Mật khẩu mới nếu đặt lại phải có ít nhất 6 ký tự.');
      return;
    }

    const payload: UserUpdateRequest = {
      email: editEmail.trim(),
      avatarUrl: editAvatarUrl.trim() || null,
      bankBin: editBankBin.trim() || null,
      bankAccountNumber: editBankAccountNumber.trim() || null,
      bankAccountName: editBankAccountName.trim() || null,
      ...(editPassword ? { password: editPassword } : {}),
    };

    setIsSaving(true);
    setMutationError(null);
    try {
      await onUpdateUser(editingUser.id, payload);
      setEditingUser(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể lưu thông tin người dùng.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingUser || !onDeleteUser) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await onDeleteUser(deletingUser.id);
      setDeletingUser(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể xóa người dùng.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header và tìm kiếm */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-heading-sm font-bold text-foreground">
            Quản lý Người dùng
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Tổng cộng: {users.length} tài khoản trong hệ thống
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Tìm tên, email, vai trò..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Làm mới
            </Button>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="danger" title="Lỗi tải dữ liệu">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Đang tải danh sách người dùng..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Không tìm thấy người dùng"
          description="Thử thay đổi từ khóa tìm kiếm hoặc làm mới lại trang."
          size="sm"
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-caption font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-3.5">Người dùng</th>
                <th className="p-3.5">Vai trò</th>
                <th className="p-3.5">Ngân hàng</th>
                <th className="p-3.5">Ngày tạo</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const admin = isAdmin(user);

                return (
                  <tr key={user.id} className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatarUrl ?? undefined}
                          name={user.username}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-foreground">
                            {user.username}
                          </p>
                          <p className="truncate text-caption text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {admin ? (
                          <Badge variant="warning" size="sm">
                            <Shield size={12} className="mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            <User size={12} className="mr-1" />
                            User
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {user.bankAccountNumber ? (
                        <div>
                          <p className="font-mono text-caption font-semibold text-foreground">
                            {user.bankAccountNumber}
                          </p>
                          <p className="text-micro text-muted-foreground">
                            {user.bankBin} · {user.bankAccountName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-caption text-muted-foreground">Chưa cấu hình</span>
                      )}
                    </td>

                    <td className="p-3.5 text-caption text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Pencil size={14} />}
                          onClick={() => openEditModal(user)}
                        >
                          Sửa
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 size={14} />}
                          className="text-danger hover:bg-danger-soft"
                          disabled={admin}
                          onClick={() => {
                            setMutationError(null);
                            setDeletingUser(user);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Chỉnh sửa người dùng */}
      <Modal
        isOpen={editingUser !== null}
        onClose={() => {
          if (!isSaving) {
            setEditingUser(null);
            setMutationError(null);
          }
        }}
        title={`Chỉnh sửa tài khoản: ${editingUser?.username}`}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                setEditingUser(null);
                setMutationError(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="admin-edit-user-form"
              variant="primary"
              loading={isSaving}
              loadingText="Đang lưu..."
              onClick={(e) => {
                const form = document.getElementById('admin-edit-user-form') as HTMLFormElement;
                if (form) form.requestSubmit();
                else void handleSaveUser(e as unknown as FormEvent<HTMLFormElement>);
              }}
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <form id="admin-edit-user-form" className="space-y-4" onSubmit={(e) => void handleSaveUser(e)}>
          {mutationError && (
            <Alert variant="danger">{mutationError}</Alert>
          )}

          <Input
            label="Địa chỉ Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            required
          />

          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />

          <Input
            label="Avatar URL"
            placeholder="https://..."
            value={editAvatarUrl}
            onChange={(e) => setEditAvatarUrl(e.target.value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Mã ngân hàng (BIN)"
              placeholder="Ví dụ: 970422"
              value={editBankBin}
              onChange={(e) => setEditBankBin(e.target.value)}
            />
            <Input
              label="Số tài khoản"
              placeholder="Ví dụ: 0123456789"
              value={editBankAccountNumber}
              onChange={(e) => setEditBankAccountNumber(e.target.value)}
            />
          </div>

          <Input
            label="Tên chủ tài khoản"
            placeholder="Ví dụ: NGUYEN VAN A"
            value={editBankAccountName}
            onChange={(e) => setEditBankAccountName(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal Xác nhận xóa người dùng */}
      <Modal
        isOpen={deletingUser !== null}
        onClose={() => {
          if (!isDeleting) setDeletingUser(null);
        }}
        title="Xác nhận xóa người dùng"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingUser(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              loadingText="Đang xóa..."
              onClick={() => void handleConfirmDelete()}
            >
              Xóa tài khoản
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-body-sm text-foreground">
            Bạn có chắc muốn xóa tài khoản <strong>{deletingUser?.username}</strong>?
          </p>
          <p className="text-caption text-muted-foreground">
            Hành động này không thể hoàn tác. Toàn bộ thông tin hồ sơ của tài khoản này sẽ bị xóa khỏi hệ thống.
          </p>
          {mutationError && (
            <div className="mt-3">
              <Alert variant="danger">{mutationError}</Alert>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
