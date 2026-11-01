import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, RotateCcw } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import { Spinner } from "../../components/ui/feedback/Spinner";
import { Button } from "../../components/ui/form/Button";
import { SegmentedControl } from "../../components/ui/form/SegmentedControl";
import { PlaceCard, type Place } from "../../components/ui/display/PlaceCard";
import type { ApiResponse, PlaceResponse } from "../../types/api";
import { calculateHaversineDistance } from "../../utils/geoCalculator";
import PlaceFilterBar from "./PlaceFilterBar";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PlaceCatalogViewProps {
  accessToken?: string;
  apiBaseUrl?: string;
}

type CatalogMode = "list" | "swipe";

const DEFAULT_API_BASE_URL = "http://localhost:8080";
const PLACE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f3eee7'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' font-size='72'%3E%F0%9F%8D%BD%3C/text%3E%3C/svg%3E";
const VIEW_OPTIONS = [
  { label: "Danh sách", value: "list" },
  { label: "Quẹt thẻ", value: "swipe" },
];

function isPlaceResponse(value: unknown): value is PlaceResponse {
  if (typeof value !== "object" || value === null) return false;
  const place = value as Record<string, unknown>;
  return (
    typeof place.id === "string" &&
    typeof place.name === "string" &&
    (typeof place.category === "string" || place.category === null) &&
    (typeof place.priceRange === "number" || place.priceRange === null) &&
    (typeof place.imageUrl === "string" || place.imageUrl === null) &&
    (typeof place.address === "string" || place.address === null) &&
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude)
  );
}

function toPlaceCardPlace(place: PlaceResponse): Place {
  const priceRange =
    place.priceRange === 2 || place.priceRange === 3 ? place.priceRange : 1;

  return {
    id: place.id,
    name: place.name,
    category: place.category?.trim() || "Khác",
    price_range: priceRange,
    image_url: place.imageUrl?.trim() || PLACE_IMAGE_PLACEHOLDER,
    address: place.address?.trim() || "Chưa cập nhật địa chỉ",
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

function getPlacesEndpoint(apiBaseUrl: string): string {
  const baseUrl = apiBaseUrl.trim().replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/api/v1")
    ? `${baseUrl}/places`
    : `${baseUrl}/api/v1/places`;
  return new URL(endpoint, window.location.origin).toString();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Đã có lỗi xảy ra khi tải địa điểm.";
}

export default function PlaceCatalogView({
  accessToken,
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
}: PlaceCatalogViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const mode: CatalogMode = requestedMode === "swipe" ? "swipe" : "list";

  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(
    null,
  );
  const [retryKey, setRetryKey] = useState(0);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(searchValue.trim()),
      searchValue.trim() ? 300 : 0,
    );
    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const requestUrl = useMemo(() => {
    const url = new URL(getPlacesEndpoint(apiBaseUrl));

    if (coordinates) {
      url.searchParams.set("latitude", String(coordinates.latitude));
      url.searchParams.set("longitude", String(coordinates.longitude));
      url.searchParams.set("radius", String(radiusKm));
      if (selectedCategory) {
        url.searchParams.set("category", selectedCategory);
      }
    } else if (debouncedSearch) {
      url.searchParams.set("name", debouncedSearch);
    } else if (selectedCategory) {
      url.searchParams.set("category", selectedCategory);
    }

    return url.toString();
  }, [apiBaseUrl, coordinates, debouncedSearch, radiusKm, selectedCategory]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const headers = new Headers({ Accept: "application/json" });
        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }

        const response = await fetch(requestUrl, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        let payload: unknown;
        try {
          payload = await response.json();
        } catch {
          throw new Error("Máy chủ trả về dữ liệu địa điểm không hợp lệ.");
        }

        if (!response.ok) {
          const apiMessage =
            typeof payload === "object" &&
            payload !== null &&
            "message" in payload &&
            typeof payload.message === "string"
              ? payload.message
              : null;

          if (response.status === 403) {
            throw Object.assign(
              new Error(
                "Máy chủ từ chối quyền xem danh sách địa điểm (403). SecurityConfig hiện có thể chưa mở GET /api/v1/places cho tài khoản người dùng.",
              ),
              { status: response.status },
            );
          }

          throw Object.assign(
            new Error(
              apiMessage ??
                `Không thể tải địa điểm (HTTP ${response.status}). Vui lòng thử lại.`,
            ),
            { status: response.status },
          );
        }

        const result =
          typeof payload === "object" && payload !== null && "result" in payload
            ? (payload as ApiResponse<unknown>).result
            : null;

        if (!Array.isArray(result) || !result.every(isPlaceResponse)) {
          throw new Error("Máy chủ trả về danh sách địa điểm không đúng định dạng.");
        }

        setPlaces(result);
        setCategories((currentCategories) => {
          const nextCategories = new Set(currentCategories);
          for (const place of result) {
            const category = place.category?.trim();
            if (category) nextCategories.add(category);
          }
          return [...nextCategories].sort((a, b) => a.localeCompare(b, "vi"));
        });
        setSwipeIndex(0);
        setSelectedPlace(null);
      } catch (loadError) {
        if (controller.signal.aborted) return;

        const status =
          typeof loadError === "object" &&
          loadError !== null &&
          "status" in loadError &&
          typeof loadError.status === "number"
            ? loadError.status
            : undefined;
        setError({ message: getErrorMessage(loadError), status });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPlaces();
    return () => controller.abort();
  }, [accessToken, requestUrl, retryKey]);

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt này không hỗ trợ xác định vị trí.");
      return;
    }

    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        setCoordinates({
          latitude: position.latitude,
          longitude: position.longitude,
        });
        setLocating(false);
      },
      (geoError) => {
        setLocating(false);
        setLocationError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Bạn chưa cấp quyền vị trí. Hãy bật quyền vị trí để tìm quán gần bạn."
            : "Không thể lấy vị trí hiện tại. Vui lòng thử lại.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  function changeMode(value: string): void {
    const nextParams = new URLSearchParams(searchParams);
    if (value === "swipe") {
      nextParams.set("mode", "swipe");
    } else {
      nextParams.delete("mode");
    }
    setSearchParams(nextParams, { replace: true });
    setSwipeIndex(0);
    setSelectedPlace(null);
  }

  const mappedPlaces = useMemo(
    () => places.map((place) => ({ response: place, card: toPlaceCardPlace(place) })),
    [places],
  );
  const currentSwipePlace = mappedPlaces[swipeIndex];
  const errorVariant = error?.status === 403 ? "warning" : "danger";

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-overline font-semibold text-primary-strong">
            Khám phá địa điểm
          </p>
          <h1 className="mt-1 text-title font-bold text-foreground">
            Hôm nay mình ăn gì?
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Tìm một quán hợp khẩu vị hoặc quẹt thẻ để chọn nhanh.
          </p>
        </div>
        <SegmentedControl
          aria-label="Chế độ xem địa điểm"
          options={VIEW_OPTIONS}
          value={mode}
          onValueChange={changeMode}
        />
      </header>

      <PlaceFilterBar
        searchValue={searchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        radiusKm={radiusKm}
        hasLocation={coordinates !== null}
        locating={locating}
        disabled={loading}
        locationError={locationError}
        onSearchChange={setSearchValue}
        onCategoryChange={setSelectedCategory}
        onRadiusChange={setRadiusKm}
        onRequestLocation={handleRequestLocation}
      />

      {error && (
        <Alert
          variant={errorVariant}
          title={
            error.status === 403
              ? "Chưa được cấp quyền xem địa điểm"
              : "Không thể tải địa điểm"
          }
          action={
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw aria-hidden="true" size={16} />}
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Thử lại
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}

      {loading ? (
        <div
          className="flex min-h-56 items-center justify-center"
          aria-label="Đang tải địa điểm"
        >
          <Spinner size="lg" />
        </div>
      ) : !error && mappedPlaces.length === 0 ? (
        <EmptyState
          title="Chưa tìm thấy địa điểm phù hợp"
          description="Hãy thử từ khóa hoặc danh mục khác, hoặc mở rộng bán kính tìm kiếm."
          icon={<MapPin aria-hidden="true" />}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchValue("");
                setSelectedCategory(null);
                setCoordinates(null);
                setRadiusKm(5);
              }}
            >
              Xóa bộ lọc
            </Button>
          }
        />
      ) : !error && mode === "list" ? (
        <>
          <p className="text-body-sm text-muted-foreground" aria-live="polite">
            Tìm thấy {mappedPlaces.length} địa điểm
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mappedPlaces.map(({ response, card }) => (
              <PlaceCard
                key={response.id}
                place={card}
                distanceKm={
                  coordinates
                    ? calculateHaversineDistance(coordinates, {
                        latitude: response.latitude,
                        longitude: response.longitude,
                      })
                    : undefined
                }
              />
            ))}
          </div>
        </>
      ) : !error && selectedPlace ? (
        <EmptyState
          title={`Bạn đã chọn ${selectedPlace.name}`}
          description="Lựa chọn này chỉ được lưu trong phiên hiện tại."
          icon="🎉"
          action={
            <Button
              onClick={() => {
                setSelectedPlace(null);
                setSwipeIndex((index) => index + 1);
              }}
            >
              Tiếp tục xem quán khác
            </Button>
          }
        />
      ) : !error && currentSwipePlace ? (
        <div className="mx-auto w-full max-w-md space-y-3">
          <p className="text-center text-body-sm text-muted-foreground">
            {swipeIndex + 1} / {mappedPlaces.length}
          </p>
          <PlaceCard
            place={currentSwipePlace.card}
            showActions
            distanceKm={
              coordinates
                ? calculateHaversineDistance(coordinates, {
                    latitude: currentSwipePlace.response.latitude,
                    longitude: currentSwipePlace.response.longitude,
                  })
                : undefined
            }
            onPass={() => setSwipeIndex((index) => index + 1)}
            onLike={() => setSelectedPlace(currentSwipePlace.response)}
          />
        </div>
      ) : !error ? (
        <EmptyState
          title="Bạn đã xem hết địa điểm"
          description="Bạn có thể bắt đầu lại bộ quẹt để xem các quán một lần nữa."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSwipeIndex(0);
                setSelectedPlace(null);
              }}
            >
              Quẹt lại từ đầu
            </Button>
          }
        />
      ) : null}
    </section>
  );
}
