// Trang Hồ sơ cá nhân: thông tin tài khoản, cấu hình ngân hàng VietQR & sở thích ẩm thực
import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Mail,
  Save,
  Shield,
  Tag as TagIcon,
  Trash2,
  User,
} from 'lucide-react';
import { useAuthActions } from '../../features/auth/useAuthActions';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import type { TagResponse, UUID } from '../../types';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSection } from '../../components/layout/PageSection';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { Card } from '../../components/ui/display/Card';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { QRCodeDisplay } from '../../components/ui/display/QRCodeDisplay';
import { Button } from '../../components/ui/form/Button';
import { Input } from '../../components/ui/form/Input';
import { BankSelect } from '../../components/ui/form/BankSelect';
import { Tag } from '../../components/ui/form/Tag';
import { Switch } from '../../components/ui/form/Switch';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import {
  buildVietQRUrl,
  getBankByBin,
  normalizeAccountName,
} from '../../utils/vietqrBanks';

function formatDateVN(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

interface BankFormSectionProps {
  userId: UUID;
  initialBin?: string | null;
  initialAccountNumber?: string | null;
  initialAccountName?: string | null;
  isForbiddenProfileUpdate: boolean;
  error: string | null;
  isSubmitting: boolean;
  onSubmitBank: (payload: {
    bankBin: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
  }) => Promise<boolean>;
  onQrUrlChange: (url: string | null) => void;
}

function BankFormSection({
  initialBin,
  initialAccountNumber,
  initialAccountName,
  isForbiddenProfileUpdate,
  error,
  isSubmitting,
  onSubmitBank,
  onQrUrlChange,
}: BankFormSectionProps) {
  const [bankBin, setBankBin] = useState(initialBin ?? '');
  const [bankAccountNumber, setBankAccountNumber] = useState(initialAccountNumber ?? '');
  const [bankAccountName, setBankAccountName] = useState(initialAccountName ?? '');
  const [hasFormChanges, setHasFormChanges] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedBin = bankBin.trim();
    const trimmedAccNum = bankAccountNumber.trim();
    const trimmedAccName = normalizeAccountName(bankAccountName.trim());

    const success = await onSubmitBank({
      bankBin: trimmedBin || null,
      bankAccountNumber: trimmedAccNum || null,
      bankAccountName: trimmedAccName || null,
    });

    if (success) {
      setHasFormChanges(false);
      if (trimmedBin && trimmedAccNum) {
        onQrUrlChange(
          buildVietQRUrl(trimmedBin, trimmedAccNum, trimmedAccName),
        );
      } else {
        onQrUrlChange(null);
      }
    }
  };

  return (
    <PageSection
      title="Tài khoản Ngân hàng VietQR"
      subtitle="Thông tin nhận tiền chuyển khoản tự động khi tạo hóa đơn chia tiền trong nhóm ăn."
    >
      <div className="space-y-4">
        {isForbiddenProfileUpdate && (
          <Alert variant="warning" title="Giới hạn phân quyền máy chủ">
            Máy chủ hiện chưa cấp quyền cập nhật hồ sơ trực tiếp cho tài khoản thông thường (403 Forbidden). Thông tin tài khoản và phiên đăng nhập của bạn vẫn hoàn toàn an toàn.
          </Alert>
        )}

        {error && !isForbiddenProfileUpdate && (
          <Alert variant="danger" title="Lỗi cập nhật">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BankSelect
              label="Ngân hàng nhận tiền"
              hint="Chọn ngân hàng theo chuẩn Napas247 / VietQR"
              value={bankBin}
              onChange={(selectedBin) => {
                setBankBin(selectedBin);
                setHasFormChanges(true);
              }}
              required
            />

            <Input
              label="Số tài khoản ngân hàng"
              placeholder="VD: 0123456789"
              value={bankAccountNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, '');
                setBankAccountNumber(digits);
                setHasFormChanges(true);
              }}
              hint="Chỉ nhập các chữ số tài khoản thụ hưởng"
              required
            />
          </div>

          <Input
            label="Tên chủ tài khoản"
            placeholder="VD: NGUYEN VAN A"
            value={bankAccountName}
            onChange={(e) => {
              const formatted = normalizeAccountName(e.target.value);
              setBankAccountName(formatted);
              setHasFormChanges(true);
            }}
            hint="Tên viết hoa không dấu theo tài khoản ngân hàng"
            required
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!hasFormChanges || isSubmitting}
              loading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Lưu thông tin ngân hàng
            </Button>
          </div>
        </form>
      </div>
    </PageSection>
  );
}

export default function Profile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const myTags = useUserStore((state) => state.myTags);
  const showToast = useUIStore((state) => state.showToast);

  const {
    isSubmitting,
    error,
    isForbiddenProfileUpdate,
    updateProfileAndBank,
    managePersonalTag,
    fetchSystemTags,
    fetchMyTags,
  } = useAuthActions();

  // State danh sách tags hệ thống
  const [systemTags, setSystemTags] = useState<TagResponse[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isTemporaryTagMode, setIsTemporaryTagMode] = useState(false);
  const [tagActionLoadingId, setTagActionLoadingId] = useState<UUID | null>(null);

  // Link VietQR Demo nếu đã có đủ thông tin
  const initialQrUrl =
    currentUser?.bankBin && currentUser?.bankAccountNumber
      ? buildVietQRUrl(
          currentUser.bankBin,
          currentUser.bankAccountNumber,
          currentUser.bankAccountName || currentUser.username,
        )
      : null;
  const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(initialQrUrl);

  // Nạp tags hệ thống và tag của người dùng khi mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchSystemTags(), fetchMyTags()])
      .then(([tags]) => {
        if (isMounted) {
          setSystemTags(tags);
        }
      })
      .catch(() => {
        // Lỗi nếu có đã được log
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTags(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchSystemTags, fetchMyTags]);

  // Xử lý submit form ngân hàng
  const handleUpdateBankInfo = useCallback(
    async (payload: {
      bankBin: string | null;
      bankAccountNumber: string | null;
      bankAccountName: string | null;
    }): Promise<boolean> => {
      if (!currentUser) return false;
      try {
        const result = await updateProfileAndBank(currentUser.id, payload);
        return Boolean(result);
      } catch {
        return false;
      }
    },
    [currentUser, updateProfileAndBank],
  );

  // Xử lý thêm tag sở thích
  const handleAddTag = useCallback(
    async (tagId: UUID) => {
      setTagActionLoadingId(tagId);
      try {
        await managePersonalTag('add', tagId, { temporary: isTemporaryTagMode });
        showToast('success', 'Đã thêm sở thích ẩm thực');
      } catch {
        showToast('danger', 'Không thể thêm tag sở thích');
      } finally {
        setTagActionLoadingId(null);
      }
    },
    [managePersonalTag, isTemporaryTagMode, showToast],
  );

  // Xử lý xóa tag sở thích
  const handleRemoveTag = useCallback(
    async (tagId: UUID) => {
      setTagActionLoadingId(tagId);
      try {
        await managePersonalTag('remove', tagId);
        showToast('info', 'Đã xóa tag khỏi sở thích');
      } catch {
        showToast('danger', 'Không thể xóa tag');
      } finally {
        setTagActionLoadingId(null);
      }
    },
    [managePersonalTag, showToast],
  );

  // Tập hợp các ID tag mà người dùng đã sở hữu
  const myTagIdSet = new Set(myTags.map((mt) => mt.tag.id));
  const availableSystemTags = systemTags.filter((st) => !myTagIdSet.has(st.id));

  const currentBank = getBankByBin(currentUser?.bankBin);

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-6">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản, ngân hàng nhận tiền VietQR và sở thích ẩm thực của bạn."
      />

      <Grid cols={1} lgCols={3} gap={6} className="items-start">
        {/* CỘT TRÁI: Thẻ thông tin tài khoản */}
        <Stack gap={6} className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                size="xl"
                name={currentUser?.username ?? 'U'}
                src={currentUser?.avatarUrl ?? undefined}
                className="ring-4 ring-primary/20"
              />
              <h2 className="mt-4 text-h3 font-heading text-foreground font-bold">
                {currentUser?.username || 'Người dùng'}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-body-sm text-foreground-muted">
                <Mail className="h-4 w-4" />
                {currentUser?.email || 'Chưa cập nhật email'}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {currentUser?.roles?.map((role) => {
                  const roleStr = String(role);
                  const isAdminRole = roleStr.includes('ADMIN');
                  return (
                    <Badge
                      key={roleStr}
                      variant={isAdminRole ? 'danger' : 'default'}
                      className="font-mono text-overline"
                    >
                      <Shield className="mr-1 h-3 w-3 inline" />
                      {roleStr}
                    </Badge>
                  );
                })}
              </div>

              <div className="mt-6 w-full border-t border-border pt-4 text-left">
                <div className="flex items-center justify-between text-body-sm text-foreground-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Ngày tham gia
                  </span>
                  <span className="font-medium text-foreground">
                    {currentUser?.createdAt ? formatDateVN(currentUser.createdAt) : 'Mới tham gia'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Hộp xem trước mã QR VietQR nếu đã có thông tin */}
          {previewQrUrl && (
            <div className="space-y-2">
              <QRCodeDisplay
                qrSrc={previewQrUrl}
                amount={50000}
                receiverName={currentUser?.bankAccountName || currentUser?.username || 'Bạn'}
                bankName={currentBank?.shortName || currentUser?.bankBin || 'Ngân hàng'}
                accountNo={currentUser?.bankAccountNumber || undefined}
                note="Demo Hom Nay An Gi"
              />
              <p className="text-center text-caption text-foreground-muted">
                Mã QR chuẩn Napas247 sẽ tự động hiển thị cho bạn bè khi chia tiền hóa đơn.
              </p>
            </div>
          )}
        </Stack>

        {/* CỘT PHẢI: Form ngân hàng & Quản lý Tags sở thích */}
        <Stack gap={6} className="lg:col-span-2">
          {/* PHẦN 1: Cấu hình Tài khoản Ngân hàng nhận tiền VietQR */}
          {currentUser && (
            <BankFormSection
              key={currentUser.id}
              userId={currentUser.id}
              initialBin={currentUser.bankBin}
              initialAccountNumber={currentUser.bankAccountNumber}
              initialAccountName={currentUser.bankAccountName}
              isForbiddenProfileUpdate={isForbiddenProfileUpdate}
              error={error}
              isSubmitting={isSubmitting}
              onSubmitBank={handleUpdateBankInfo}
              onQrUrlChange={setPreviewQrUrl}
            />
          )}

          {/* PHẦN 2: Sở thích Ẩm thực & Tags Cá Nhân */}
          <PageSection
            title="Khẩu vị & Sở thích Ẩm thực"
            subtitle="Gợi ý món ăn và hỗ trợ ghép phòng theo tâm trạng ăn uống."
          >
            <div className="space-y-6">
              {/* Tags người dùng đã lưu */}
              <div>
                <h3 className="text-body-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-primary" />
                  Sở thích của bạn ({myTags.length})
                </h3>

                {myTags.length === 0 ? (
                  <EmptyState
                    size="sm"
                    icon={<User className="h-8 w-8 text-foreground-muted" />}
                    title="Chưa có tag sở thích nào"
                    description="Hãy chọn các thẻ ẩm thực bên dưới để cá nhân hóa gợi ý quán ăn."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myTags.map((userTag) => {
                      const isRemoving = tagActionLoadingId === userTag.tag.id;
                      return (
                        <div
                          key={userTag.tag.id}
                          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-body-sm font-medium text-foreground transition-all"
                        >
                          <span>{userTag.tag.tagName}</span>
                          {userTag.temporary && (
                            <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                              Tạm thời
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(userTag.tag.id)}
                            disabled={isRemoving}
                            className="focus-ring ml-0.5 p-1 rounded-full text-foreground-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                            aria-label={`Xóa tag ${userTag.tag.tagName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Danh sách Tag hệ thống có thể thêm */}
              <div className="border-t border-border pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-body-sm font-semibold text-foreground">
                    Gợi ý sở thích từ hệ thống
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-foreground-muted">Chế độ tạm thời</span>
                    <Switch
                      checked={isTemporaryTagMode}
                      onCheckedChange={(checked) => setIsTemporaryTagMode(checked)}
                      aria-label="Thêm tag ở chế độ tạm thời"
                    />
                  </div>
                </div>

                {isLoadingTags ? (
                  <div className="py-8 flex justify-center">
                    <Spinner size="md" label="Đang tải danh sách tags..." />
                  </div>
                ) : availableSystemTags.length === 0 ? (
                  <p className="text-body-sm text-foreground-muted italic py-2">
                    Bạn đã thêm tất cả các tag ẩm thực có sẵn trong hệ thống.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSystemTags.map((tag) => {
                      const isAdding = tagActionLoadingId === tag.id;
                      return (
                        <Tag
                          key={tag.id}
                          label={tag.tagName}
                          size="md"
                          disabled={isAdding}
                          onClick={() => handleAddTag(tag.id)}
                          className="hover:border-primary cursor-pointer"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </PageSection>
        </Stack>
      </Grid>
    </PageContainer>
  );
}
