import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import type { TagRequest, TagResponse, UUID } from '../../types';
import { SearchInput } from '../../components/ui/form/SearchInput';
import { Button } from '../../components/ui/form/Button';
import { Input } from '../../components/ui/form/Input';
import { Modal } from '../../components/ui/feedback/Modal';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface AdminTagManagerProps {
  tags?: TagResponse[];
  isLoading?: boolean;
  error?: string | null;
  onCreateTag?: (payload: TagRequest) => Promise<TagResponse | null | void>;
  onUpdateTag?: (tagId: UUID, payload: TagRequest) => Promise<TagResponse | null | void>;
  onDeleteTag?: (tagId: UUID) => Promise<boolean | void>;
  onRefresh?: () => Promise<void> | void;
}

export default function AdminTagManager({
  tags = [],
  isLoading = false,
  error = null,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onRefresh,
}: AdminTagManagerProps) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagResponse | null>(null);
  const [tagName, setTagName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const filteredTags = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tags;
    return tags.filter(
      (t) => t.tagName.toLowerCase().includes(term) || t.id.toLowerCase().includes(term),
    );
  }, [query, tags]);

  function openCreateModal() {
    setMutationError(null);
    setEditingTag(null);
    setTagName('');
    setIsModalOpen(true);
  }

  function openEditModal(tag: TagResponse) {
    setMutationError(null);
    setEditingTag(tag);
    setTagName(tag.tagName);
    setIsModalOpen(true);
  }

  async function handleSaveTag(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = tagName.trim();
    if (!trimmed) {
      setMutationError('Tên Tag không được để trống.');
      return;
    }

    setIsSaving(true);
    setMutationError(null);
    try {
      if (editingTag) {
        if (onUpdateTag) await onUpdateTag(editingTag.id, { tagName: trimmed });
      } else {
        if (onCreateTag) await onCreateTag({ tagName: trimmed });
      }
      setIsModalOpen(false);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể lưu Tag.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTag || !onDeleteTag) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await onDeleteTag(deletingTag.id);
      setDeletingTag(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể xóa Tag.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-heading-sm font-bold text-foreground">
            Quản lý Tags hệ thống
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Tổng cộng: {tags.length} thẻ sở thích & tâm trạng dùng chung
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Tìm tên Tag, mã ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery('')}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={openCreateModal}
          >
            Thêm Tag
          </Button>
          {onRefresh && (
            <Button variant="outline" size="md" onClick={onRefresh}>
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
          <Spinner size="lg" label="Đang tải danh sách Tag hệ thống..." />
        </div>
      ) : filteredTags.length === 0 ? (
        <EmptyState
          title="Không tìm thấy Tag nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm Tag mới."
          size="sm"
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-caption font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-3.5">Tên Tag</th>
                <th className="p-3.5">Mã định danh (ID)</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <TagIcon size={14} />
                      </span>
                      <span>#{tag.tagName}</span>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-caption text-muted-foreground">
                    {tag.id}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Pencil size={14} />}
                        onClick={() => openEditModal(tag)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        className="text-danger hover:bg-danger-soft"
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
      )}

      {/* Modal Thêm / Sửa Tag */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSaving) setIsModalOpen(false);
        }}
        title={editingTag ? `Chỉnh sửa Tag: #${editingTag.tagName}` : 'Thêm Tag hệ thống mới'}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              loading={isSaving}
              loadingText="Đang lưu..."
              onClick={() => {
                const form = document.getElementById('admin-tag-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
            >
              {editingTag ? 'Lưu thay đổi' : 'Thêm Tag'}
            </Button>
          </div>
        }
      >
        <form id="admin-tag-form" className="space-y-4" onSubmit={(e) => void handleSaveTag(e)}>
          {mutationError && (
            <Alert variant="danger">{mutationError}</Alert>
          )}

          <Input
            label="Tên Tag (không cần nhập dấu #)"
            placeholder="Ví dụ: Lẩu cay, Cơm tấm, Trà sữa..."
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>

      {/* Modal Xóa Tag */}
      <Modal
        isOpen={deletingTag !== null}
        onClose={() => {
          if (!isDeleting) setDeletingTag(null);
        }}
        title="Xác nhận xóa Tag"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingTag(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              loadingText="Đang xóa..."
              onClick={() => void handleConfirmDelete()}
            >
              Xóa Tag
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-body-sm text-foreground">
            Bạn có chắc chắn muốn xóa Tag <strong>#{deletingTag?.tagName}</strong>?
          </p>
          <p className="text-caption text-muted-foreground">
            Người dùng sẽ không thể chọn Tag này trong các bộ lọc và ghép hội nữa.
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
