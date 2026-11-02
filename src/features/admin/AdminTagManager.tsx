import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { Modal } from "../../components/ui/feedback/Modal";
import { Button } from "../../components/ui/form/Button";
import { Input } from "../../components/ui/form/Input";
import { Card } from "../../components/ui/display/Card";
import { tagService } from "../../services/tag.service";
import type { TagResponse } from "../../types";
import {
  AdminLoadError,
  AdminLoading,
  AdminMutationError,
} from "./AdminCommon";
import { getAdminErrorMessage } from "./adminUtils";

export default function AdminTagManager() {
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTag, setDeletingTag] = useState<TagResponse | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setTags(await tagService.getAllTags());
    } catch (error) {
      setLoadError(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    tagService.getAllTags().then((result) => {
      if (active) setTags(result);
    }).catch((error: unknown) => {
      if (active) setLoadError(getAdminErrorMessage(error));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredTags = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return needle
      ? tags.filter((tag) => tag.tagName.toLocaleLowerCase("vi").includes(needle))
      : tags;
  }, [query, tags]);

  function openForm(tag?: TagResponse) {
    setMutationError(null);
    setEditingTag(tag ?? null);
    setIsCreating(!tag);
  }

  async function saveTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tagName = String(formData.get("tagName") ?? "").trim();
    if (!tagName || tagName.length > 50) {
      setMutationError("Tên Tag bắt buộc và không được vượt quá 50 ký tự.");
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    try {
      if (editingTag) {
        await tagService.updateTag(editingTag.id, { tagName });
      } else {
        await tagService.createTag({ tagName });
      }
      setEditingTag(null);
      setIsCreating(false);
      await loadTags();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTag) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await tagService.deleteTag(deletingTag.id);
      setDeletingTag(null);
      await loadTags();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  const isFormOpen = isCreating || Boolean(editingTag);

  return (
    <section className="space-y-5" aria-label="Quản lý Tags hệ thống">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-body-sm text-muted-foreground">
          Tên Tag phải duy nhất và có tối đa 50 ký tự.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-72">
            <Input
              label="Tìm Tag"
              placeholder="Nhập tên Tag"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => openForm()}>Thêm Tag</Button>
        </div>
      </div>

      {mutationError && !isFormOpen && !deletingTag && (
        <Alert variant="danger" title="Thao tác chưa thành công" role="alert">{mutationError}</Alert>
      )}
      {isLoading ? (
        <AdminLoading label="Đang tải Tags..." />
      ) : loadError ? (
        <AdminLoadError message={loadError} onRetry={() => void loadTags()} />
      ) : filteredTags.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-body-sm text-muted-foreground">
            {tags.length ? "Không tìm thấy Tag phù hợp." : "Chưa có Tag hệ thống nào."}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-caption text-muted-foreground" aria-live="polite">
            {filteredTags.length} / {tags.length} Tags
          </p>
          <div className="hidden overflow-x-auto rounded-card border border-border md:block">
            <table className="w-full min-w-[560px] text-left text-body-sm">
              <thead className="bg-muted text-caption uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Tên Tag</th>
                  <th scope="col" className="px-4 py-3">ID</th>
                  <th scope="col" className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredTags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-4 py-3 font-semibold text-foreground">{tag.tagName}</td>
                    <td className="break-all px-4 py-3 text-muted-foreground">{tag.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openForm(tag)}>Sửa</Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<Trash2 size={15} />}
                          aria-label={`Xóa Tag ${tag.tagName}`}
                          onClick={() => {
                            setMutationError(null);
                            setDeletingTag(tag);
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
            {filteredTags.map((tag) => (
              <li key={tag.id}>
                <Card padding="sm">
                  <p className="font-semibold text-foreground">{tag.tagName}</p>
                  <p className="mt-1 break-all text-caption text-muted-foreground">{tag.id}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openForm(tag)}>Sửa</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 size={15} />}
                      onClick={() => {
                        setMutationError(null);
                        setDeletingTag(tag);
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
        isOpen={isFormOpen}
        onClose={() => {
          if (!isSaving) {
            setEditingTag(null);
            setIsCreating(false);
            setMutationError(null);
          }
        }}
        title={editingTag ? "Chỉnh sửa Tag" : "Thêm Tag hệ thống"}
        description="Tên Tag bắt buộc và tối đa 50 ký tự."
        size="sm"
        closeOnEsc={!isSaving}
        closeOnOverlayClick={!isSaving}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isSaving} onClick={() => {
              setEditingTag(null);
              setIsCreating(false);
            }}>Hủy</Button>
            <Button type="submit" form="admin-tag-form" loading={isSaving} loadingText="Đang lưu...">
              {editingTag ? "Lưu thay đổi" : "Tạo Tag"}
            </Button>
          </div>
        }
      >
        <form id="admin-tag-form" onSubmit={(event) => void saveTag(event)}>
          <Input label="Tên Tag" name="tagName" required maxLength={50} defaultValue={editingTag?.tagName ?? ""} />
          {mutationError && <AdminMutationError message={mutationError} />}
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletingTag)}
        onClose={() => {
          if (!isDeleting) {
            setDeletingTag(null);
            setMutationError(null);
          }
        }}
        title="Xác nhận xóa Tag"
        description={deletingTag ? `Bạn có chắc muốn xóa Tag "${deletingTag.tagName}"? Thao tác này không thể hoàn tác.` : undefined}
        closeOnEsc={!isDeleting}
        closeOnOverlayClick={!isDeleting}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isDeleting} onClick={() => setDeletingTag(null)}>Hủy</Button>
            <Button variant="danger" loading={isDeleting} loadingText="Đang xóa..." onClick={() => void confirmDelete()}>Xóa Tag</Button>
          </div>
        }
      >
        {mutationError && <AdminMutationError message={mutationError} />}
      </Modal>
    </section>
  );
}
