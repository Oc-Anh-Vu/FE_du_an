import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { Modal } from "../../components/ui/feedback/Modal";
import { Button } from "../../components/ui/form/Button";
import { Input } from "../../components/ui/form/Input";
import { Card } from "../../components/ui/display/Card";
import { placeService } from "../../services/place.service";
import type { PlaceCreationRequest, PlaceResponse } from "../../types";
import {
  AdminLoadError,
  AdminLoading,
  AdminMutationError,
} from "./AdminCommon";
import { getAdminErrorMessage } from "./adminUtils";

export default function AdminPlaceManager() {
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingPlace, setEditingPlace] = useState<PlaceResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingPlace, setDeletingPlace] = useState<PlaceResponse | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setPlaces(await placeService.getPlaces());
    } catch (error) {
      setLoadError(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    placeService.getPlaces().then((result) => {
      if (active) setPlaces(result);
    }).catch((error: unknown) => {
      if (active) setLoadError(getAdminErrorMessage(error));
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredPlaces = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return places;
    return places.filter((place) =>
      [place.name, place.category ?? "", place.address ?? ""]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(needle),
    );
  }, [places, query]);

  function openForm(place?: PlaceResponse) {
    setMutationError(null);
    setEditingPlace(place ?? null);
    setIsCreating(!place);
  }

  async function savePlace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const latitudeValue = String(formData.get("latitude") ?? "").trim();
    const longitudeValue = String(formData.get("longitude") ?? "").trim();
    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);

    if (!name) {
      setMutationError("Tên địa điểm là bắt buộc.");
      return;
    }
    if (!latitudeValue || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setMutationError("Vĩ độ phải là số trong khoảng -90 đến 90.");
      return;
    }
    if (!longitudeValue || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setMutationError("Kinh độ phải là số trong khoảng -180 đến 180.");
      return;
    }

    const rawPriceRange = String(formData.get("priceRange") ?? "");
    const payload: PlaceCreationRequest = {
      name,
      category: String(formData.get("category") ?? "").trim() || null,
      priceRange: rawPriceRange ? Number(rawPriceRange) : null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      latitude,
      longitude,
    };

    setIsSaving(true);
    setMutationError(null);
    try {
      if (editingPlace) {
        await placeService.updatePlace(editingPlace.id, payload);
      } else {
        await placeService.createPlace(payload);
      }
      setEditingPlace(null);
      setIsCreating(false);
      await loadPlaces();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingPlace) return;
    setIsDeleting(true);
    setMutationError(null);
    try {
      await placeService.deletePlace(deletingPlace.id);
      setDeletingPlace(null);
      await loadPlaces();
    } catch (error) {
      setMutationError(getAdminErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  const formPlace = editingPlace;
  const isFormOpen = isCreating || Boolean(editingPlace);

  return (
    <section className="space-y-5" aria-label="Quản lý địa điểm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-body-sm text-muted-foreground">
          Danh mục địa điểm ăn uống được quản lý trực tiếp qua API.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-72">
            <Input
              label="Tìm địa điểm"
              placeholder="Tên, danh mục hoặc địa chỉ"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button leftIcon={<Plus size={18} />} onClick={() => openForm()}>Thêm địa điểm</Button>
        </div>
      </div>

      {mutationError && !isFormOpen && !deletingPlace && (
        <Alert variant="danger" title="Thao tác chưa thành công" role="alert">{mutationError}</Alert>
      )}
      {isLoading ? (
        <AdminLoading label="Đang tải địa điểm..." />
      ) : loadError ? (
        <AdminLoadError message={loadError} onRetry={() => void loadPlaces()} />
      ) : filteredPlaces.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-body-sm text-muted-foreground">
            {places.length ? "Không tìm thấy địa điểm phù hợp." : "Chưa có địa điểm nào."}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-caption text-muted-foreground" aria-live="polite">
            {filteredPlaces.length} / {places.length} địa điểm
          </p>
          <div className="hidden overflow-x-auto rounded-card border border-border md:block">
            <table className="w-full min-w-[850px] text-left text-body-sm">
              <thead className="bg-muted text-caption uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Địa điểm</th>
                  <th scope="col" className="px-4 py-3">Danh mục</th>
                  <th scope="col" className="px-4 py-3">Mức giá</th>
                  <th scope="col" className="px-4 py-3">Tọa độ</th>
                  <th scope="col" className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredPlaces.map((place) => (
                  <tr key={place.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{place.name}</p>
                      <p className="text-caption text-muted-foreground">{place.address || "Chưa có địa chỉ"}</p>
                    </td>
                    <td className="px-4 py-3">{place.category || "—"}</td>
                    <td className="px-4 py-3">{place.priceRange ? `${place.priceRange}/3` : "—"}</td>
                    <td className="px-4 py-3">{place.latitude}, {place.longitude}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openForm(place)}>Sửa</Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<Trash2 size={15} />}
                          aria-label={`Xóa địa điểm ${place.name}`}
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
          <ul className="space-y-3 md:hidden">
            {filteredPlaces.map((place) => (
              <li key={place.id}>
                <Card padding="sm">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{place.name}</p>
                    <p className="text-body-sm text-muted-foreground">{place.category || "Chưa phân loại"}</p>
                    <p className="text-body-sm">{place.address || "Chưa có địa chỉ"}</p>
                    <p className="text-caption text-muted-foreground">Giá: {place.priceRange ? `${place.priceRange}/3` : "Chưa cập nhật"}</p>
                    <p className="text-caption text-muted-foreground">Tọa độ: {place.latitude}, {place.longitude}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" leftIcon={<Pencil size={15} />} onClick={() => openForm(place)}>Sửa</Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 size={15} />}
                      onClick={() => {
                        setMutationError(null);
                        setDeletingPlace(place);
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
            setEditingPlace(null);
            setIsCreating(false);
            setMutationError(null);
          }
        }}
        title={editingPlace ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        description="Nhập thông tin theo yêu cầu của API địa điểm."
        size="lg"
        closeOnEsc={!isSaving}
        closeOnOverlayClick={!isSaving}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isSaving} onClick={() => {
              setEditingPlace(null);
              setIsCreating(false);
            }}>Hủy</Button>
            <Button type="submit" form="admin-place-form" loading={isSaving} loadingText="Đang lưu...">
              {editingPlace ? "Lưu thay đổi" : "Tạo địa điểm"}
            </Button>
          </div>
        }
      >
        <form id="admin-place-form" className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void savePlace(event)}>
          <Input label="Tên địa điểm" name="name" required maxLength={255} defaultValue={formPlace?.name ?? ""} className="sm:col-span-2" />
          <Input label="Danh mục" name="category" defaultValue={formPlace?.category ?? ""} />
          <div className="w-full space-y-1.5">
            <label htmlFor="admin-place-price-range" className="block text-body-sm font-semibold text-foreground">Mức giá</label>
            <select
              id="admin-place-price-range"
              name="priceRange"
              defaultValue={formPlace?.priceRange?.toString() ?? ""}
              className="focus-ring h-11 w-full rounded-control border border-input bg-card px-4 text-body text-foreground"
            >
              <option value="">Chưa cập nhật</option>
              <option value="1">1 - Tiết kiệm</option>
              <option value="2">2 - Trung bình</option>
              <option value="3">3 - Cao</option>
            </select>
          </div>
          <Input label="Địa chỉ" name="address" defaultValue={formPlace?.address ?? ""} className="sm:col-span-2" />
          <Input label="URL hình ảnh" name="imageUrl" type="url" defaultValue={formPlace?.imageUrl ?? ""} className="sm:col-span-2" />
          <Input label="Vĩ độ (latitude)" name="latitude" type="number" required min={-90} max={90} step="any" defaultValue={formPlace?.latitude ?? ""} />
          <Input label="Kinh độ (longitude)" name="longitude" type="number" required min={-180} max={180} step="any" defaultValue={formPlace?.longitude ?? ""} />
          {mutationError && <div className="sm:col-span-2"><AdminMutationError message={mutationError} /></div>}
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deletingPlace)}
        onClose={() => {
          if (!isDeleting) {
            setDeletingPlace(null);
            setMutationError(null);
          }
        }}
        title="Xác nhận xóa địa điểm"
        description={deletingPlace ? `Bạn có chắc muốn xóa "${deletingPlace.name}"? Thao tác này không thể hoàn tác.` : undefined}
        closeOnEsc={!isDeleting}
        closeOnOverlayClick={!isDeleting}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isDeleting} onClick={() => setDeletingPlace(null)}>Hủy</Button>
            <Button variant="danger" loading={isDeleting} loadingText="Đang xóa..." onClick={() => void confirmDelete()}>Xóa địa điểm</Button>
          </div>
        }
      >
        {mutationError && <AdminMutationError message={mutationError} />}
      </Modal>
    </section>
  );
}
