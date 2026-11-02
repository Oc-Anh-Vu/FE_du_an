import { useMemo, useState, type FormEvent } from 'react';
import { Compass, MapPin, Pencil, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import type {
  PlaceCreationRequest,
  PlaceResponse,
  PlaceUpdateRequest,
  PriceRange,
  UUID,
} from '../../types';
import { SearchInput } from '../../components/ui/form/SearchInput';
import { Button } from '../../components/ui/form/Button';
import { Input } from '../../components/ui/form/Input';
import { Badge } from '../../components/ui/display/Badge';
import { Modal } from '../../components/ui/feedback/Modal';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface AdminPlaceManagerProps {
  places?: PlaceResponse[];
  isLoading?: boolean;
  error?: string | null;
  onCreatePlace?: (payload: PlaceCreationRequest) => Promise<PlaceResponse | null | void>;
  onUpdatePlace?: (placeId: UUID, payload: PlaceUpdateRequest) => Promise<PlaceResponse | null | void>;
  onDeletePlace?: (placeId: UUID) => Promise<boolean | void>;
  onRefresh?: () => Promise<void> | void;
}

export default function AdminPlaceManager({
  places = [],
  isLoading = false,
  error = null,
  onCreatePlace,
  onUpdatePlace,
  onDeletePlace,
  onRefresh,
}: AdminPlaceManagerProps) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceResponse | null>(null);
  const [deletingPlace, setDeletingPlace] = useState<PlaceResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Form states cho Modal Thêm/Sửa
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>(1);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const filteredPlaces = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return places;
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.address && p.address.toLowerCase().includes(term)),
    );
  }, [places, query]);

  function openCreateModal() {
    setMutationError(null);
    setEditingPlace(null);
    setName('');
    setCategory('');
    setPriceRange(1);
    setAddress('');
    setLatitude('10.7769');
    setLongitude('106.7009');
    setImageUrl('');
    setIsModalOpen(true);
  }

  function openEditModal(place: PlaceResponse) {
    setMutationError(null);
    setEditingPlace(place);
    setName(place.name);
    setCategory(place.category || '');
    setPriceRange((place.priceRange as PriceRange) || 1);
    setAddress(place.address || '');
    setLatitude(String(place.latitude));
    setLongitude(String(place.longitude));
    setImageUrl(place.imageUrl || '');
    setIsModalOpen(true);
  }

  async function handleSavePlace(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMutationError(null);

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setMutationError('Vĩ độ (Latitude) phải nằm trong khoảng từ -90 đến 90.');
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setMutationError('Kinh độ (Longitude) phải nằm trong khoảng từ -180 đến 180.');
      return;
    }

    const payload: PlaceCreationRequest = {
      name: name.trim(),
      category: category.trim() || null,
      priceRange,
      address: address.trim() || null,
      latitude: lat,
      longitude: lng,
      imageUrl: imageUrl.trim() || null,
    };

    setIsSaving(true);
    try {
      if (editingPlace) {
        if (onUpdatePlace) await onUpdatePlace(editingPlace.id, payload);
      } else {
        if (onCreatePlace) await onCreatePlace(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể lưu địa điểm.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingPlace || !onDeletePlace) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await onDeletePlace(deletingPlace.id);
      setDeletingPlace(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Không thể xóa địa điểm.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-heading-sm font-bold text-foreground">
            Quản lý Địa điểm ăn uống
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Tổng cộng: {places.length} địa điểm trong hệ thống
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="w-full sm:w-64">
            <SearchInput
              placeholder="Tìm tên quán, danh mục, địa chỉ..."
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
            Thêm quán
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
          <Spinner size="lg" label="Đang tải danh sách địa điểm..." />
        </div>
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          title="Không tìm thấy địa điểm"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm quán mới."
          size="sm"
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-caption font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-3.5">Quán ăn</th>
                <th className="p-3.5">Danh mục</th>
                <th className="p-3.5">Khoảng giá</th>
                <th className="p-3.5">Tọa độ GPS</th>
                <th className="p-3.5">Địa chỉ</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="transition-colors hover:bg-muted/30">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {place.imageUrl ? (
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="size-10 rounded-control object-cover border border-border shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-secondary text-base">
                          🍽️
                        </div>
                      )}
                      <span className="font-bold text-foreground">
                        {place.name}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    {place.category ? (
                      <Badge variant="default" size="sm">
                        <TagIcon size={12} className="mr-1" />
                        {place.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-caption">—</span>
                    )}
                  </td>

                  <td className="p-3.5 font-bold text-primary-strong">
                    {place.priceRange ? '$'.repeat(Number(place.priceRange)) : '$'}
                  </td>

                  <td className="p-3.5 font-mono text-caption text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Compass size={13} className="text-primary" />
                      <span>
                        {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5 text-caption text-muted-foreground max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{place.address || 'Chưa có địa chỉ'}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Pencil size={14} />}
                        onClick={() => openEditModal(place)}
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
                          setDeletingPlace(place);
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

      {/* Modal Thêm / Sửa địa điểm */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSaving) {
            setIsModalOpen(false);
            setMutationError(null);
          }
        }}
        title={editingPlace ? `Chỉnh sửa: ${editingPlace.name}` : 'Thêm địa điểm ăn uống mới'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                setIsModalOpen(false);
                setMutationError(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="admin-place-form"
              variant="primary"
              loading={isSaving}
              loadingText="Đang lưu..."
              onClick={() => {
                const form = document.getElementById('admin-place-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
            >
              {editingPlace ? 'Lưu thay đổi' : 'Thêm địa điểm'}
            </Button>
          </div>
        }
      >
        <form id="admin-place-form" className="space-y-4" onSubmit={(e) => void handleSavePlace(e)}>
          {mutationError && (
            <Alert variant="danger">{mutationError}</Alert>
          )}

          <Input
            label="Tên quán ăn"
            placeholder="Ví dụ: Phở Thìn Lò Đúc, Cơm Tấm Ba Ghiền..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Danh mục món"
              placeholder="Ví dụ: Phở, Lẩu, Cơm tấm..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <div>
              <label htmlFor="price-select" className="block text-body-sm font-semibold text-foreground mb-1">
                Khoảng giá
              </label>
              <select
                id="price-select"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value) as PriceRange)}
                className="focus-ring h-11 w-full rounded-control border border-border bg-card px-3 text-body-sm font-semibold text-foreground transition-colors hover:border-primary/50"
              >
                <option value={1}>$ · Bình dân / Tiết kiệm</option>
                <option value={2}>$$ · Vừa phải / Phổ thông</option>
                <option value={3}>$$$ · Cao cấp</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Vĩ độ (Latitude)"
              placeholder="Ví dụ: 10.7769"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
            <Input
              label="Kinh độ (Longitude)"
              placeholder="Ví dụ: 106.7009"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>

          <Input
            label="Địa chỉ cụ thể"
            placeholder="Ví dụ: 13 Lò Đúc, Hai Bà Trưng, Hà Nội"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Image URL"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal Xóa địa điểm */}
      <Modal
        isOpen={deletingPlace !== null}
        onClose={() => {
          if (!isDeleting) setDeletingPlace(null);
        }}
        title="Xác nhận xóa địa điểm"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingPlace(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isDeleting}
              loadingText="Đang xóa..."
              onClick={() => void handleConfirmDelete()}
            >
              Xóa địa điểm
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <p className="text-body-sm text-foreground">
            Bạn có chắc chắn muốn xóa địa điểm <strong>{deletingPlace?.name}</strong>?
          </p>
          <p className="text-caption text-muted-foreground">
            Quán ăn này sẽ bị gỡ bỏ khỏi hệ thống và không còn xuất hiện trong các bộ bài quẹt thẻ.
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
