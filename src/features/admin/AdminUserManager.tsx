import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { Modal } from "../../components/ui/feedback/Modal";
import { Button } from "../../components/ui/form/Button";
import { Input } from "../../components/ui/form/Input";
import { Card } from "../../components/ui/display/Card";
import { userService } from "../../services/user.service";
import type { UserResponse, UserUpdateRequest } from "../../types";
import {
  AdminLoadError,
  AdminLoading,
  AdminMutationError,
} from "./AdminCommon";
import { formatAdminDate, getAdminErrorMessage } from "./adminUtils";

function isAdminAccount(user: UserResponse): boolean {
  return user.roles.some((role) => {
    const normalized = String(role).trim().toUpperCase();
    return normalized === "ROLE_ADMIN" || normalized === "ADMIN";
  });
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setUsers(await userService.getUsers());
    } catch (error) {
      setLoadError(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    userService.getUsers().then((result) => {
      if (active) setUsers(result);
    }).catch((error: unknown) => {
      if (active) setLoadError(getAdminErrorMessage(error));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return users;
    return users.filter((user) =>
      [user.username, user.email, user.id, ...user.roles]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(needle),
    );
  }, [query, users]);

  function openEdit(user: UserResponse) {
    setMutationError(null);
    setEditingUser(user);
  }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (password && password.length < 6) {
      setMutationError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    const payload: UserUpdateRequest = {
      email,
      avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
      bankBin: String(formData.get("bankBin") ?? "").trim() || null,
      bankAccountNumber: String(formData.get("bankAccountNumber") ?? "").trim() || null,
      bankAccountName: String(formData.get("bankAccountName") ?? "").trim() || null,
      ...(password ? { password } : {}),
    };

    setIsSaving(true);
    setMutationError(null);
    try {
      await userService.updateUser(editingUser.id, payload);
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingUser) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await userService.deleteUser(deletingUser.id);
      setDeletingUser(null);
      await loadUsers();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="space-y-5" aria-label="Quản lý người dùng">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-body-sm text-muted-foreground">
          Danh sách hồ sơ và thao tác được hỗ trợ bởi API quản trị.
        </p>
        <div className="w-full sm:max-w-sm">
          <Input
            label="Tìm người dùng"
            placeholder="Tên, email, ID hoặc vai trò"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
      </div>

      {mutationError && !editingUser && !deletingUser && (
        <Alert variant="danger" title="Thao tác chưa thành công" role="alert">{mutationError}</Alert>
      )}
      {isLoading ? (
        <AdminLoading label="Đang tải người dùng..." />
      ) : loadError ? (
        <AdminLoadError message={loadError} onRetry={() => void loadUsers()} />
      ) : filteredUsers.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-body-sm text-muted-foreground">
            {users.length ? "Không tìm thấy người dùng phù hợp." : "Chưa có người dùng nào."}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-caption text-muted-foreground" aria-live="polite">
            {filteredUsers.length} / {users.length} người dùng
          </p>
          <div className="hidden overflow-x-auto rounded-card border border-border md:block">
            <table className="w-full min-w-[900px] text-left text-body-sm">
              <thead className="bg-muted text-caption uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Tài khoản</th>
                  <th scope="col" className="px-4 py-3">Vai trò</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                  <th scope="col" className="px-4 py-3">Ngày tạo</th>
                  <th scope="col" className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{user.username}</p>
                      <p className="text-caption text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">{user.roles.join(", ") || "—"}</td>
                    <td className="px-4 py-3">{user.status}</td>
                    <td className="px-4 py-3">{formatAdminDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openEdit(user)}>Sửa</Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<Trash2 size={15} />}
                          disabled={isAdminAccount(user)}
                          aria-label={`Xóa tài khoản ${user.username}`}
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
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 md:hidden">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <Card padding="sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{user.username}</p>
                    <p className="break-all text-caption text-muted-foreground">{user.email}</p>
                    <p className="break-all text-caption text-muted-foreground">{user.id}</p>
                    <p className="text-body-sm">Vai trò: {user.roles.join(", ") || "—"}</p>
                    <p className="text-body-sm">Trạng thái: {user.status}</p>
                    <p className="text-caption text-muted-foreground">Tạo: {formatAdminDate(user.createdAt)}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openEdit(user)}>Sửa</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 size={15} />}
                      disabled={isAdminAccount(user)}
                      onClick={() => {
                        setMutationError(null);
                        setDeletingUser(user);
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => {
          if (!isSaving) {
            setEditingUser(null);
            setMutationError(null);
          }
        }}
        title="Cập nhật người dùng"
        description={editingUser ? `Tài khoản ${editingUser.username}. Vai trò và trạng thái chỉ hiển thị; API chưa hỗ trợ chỉnh sửa tại màn hình này.` : undefined}
        size="lg"
        closeOnEsc={!isSaving}
        closeOnOverlayClick={!isSaving}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isSaving} onClick={() => setEditingUser(null)}>Hủy</Button>
            <Button type="submit" form="admin-user-form" loading={isSaving} loadingText="Đang lưu...">Lưu thay đổi</Button>
          </div>
        }
      >
        {editingUser && (
          <form id="admin-user-form" className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void saveUser(event)}>
            <Input label="Email" name="email" type="email" required defaultValue={editingUser.email} />
            <Input label="Mật khẩu mới" name="password" type="password" minLength={6} autoComplete="new-password" hint="Để trống nếu không muốn thay đổi." />
            <Input label="URL ảnh đại diện" name="avatarUrl" type="url" defaultValue={editingUser.avatarUrl ?? ""} />
            <Input label="Mã ngân hàng (BIN)" name="bankBin" defaultValue={editingUser.bankBin ?? ""} />
            <Input label="Số tài khoản ngân hàng" name="bankAccountNumber" defaultValue={editingUser.bankAccountNumber ?? ""} />
            <Input label="Tên chủ tài khoản" name="bankAccountName" defaultValue={editingUser.bankAccountName ?? ""} />
            {mutationError && <div className="sm:col-span-2"><AdminMutationError message={mutationError} /></div>}
          </form>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(deletingUser)}
        onClose={() => {
          if (!isDeleting) {
            setDeletingUser(null);
            setMutationError(null);
          }
        }}
        title="Xác nhận xóa người dùng"
        description={deletingUser ? `Bạn có chắc muốn xóa tài khoản "${deletingUser.username}"? Thao tác này không thể hoàn tác.` : undefined}
        closeOnEsc={!isDeleting}
        closeOnOverlayClick={!isDeleting}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isDeleting} onClick={() => setDeletingUser(null)}>Hủy</Button>
            <Button variant="danger" loading={isDeleting} loadingText="Đang xóa..." onClick={() => void confirmDelete()}>Xóa tài khoản</Button>
          </div>
        }
      >
        {mutationError && <AdminMutationError message={mutationError} />}
      </Modal>
    </section>
  );
}
