import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../../utils/cn";
import {
  getBankByBin,
  searchBanks,
  type VietQRBank,
} from "../../../utils/vietqrBanks";

export interface BankSelectProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | null;
  onChange?: (bin: string, bank?: VietQRBank) => void;
  className?: string;
}

export function BankSelect({
  label = "Ngân hàng",
  hint,
  error,
  required,
  disabled,
  value,
  onChange,
  className,
}: BankSelectProps) {
  const internalId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualBin, setManualBin] = useState("");

  const selectedBank = useMemo(() => getBankByBin(value), [value]);

  const filteredBanks = useMemo(
    () => searchBanks(searchQuery),
    [searchQuery],
  );

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus vào ô search khi mở
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectBank = (bank: VietQRBank) => {
    setIsManualInput(false);
    setIsOpen(false);
    setSearchQuery("");
    onChange?.(bank.bin, bank);
  };

  const handleManualSubmit = () => {
    const clean = manualBin.trim();
    if (clean) {
      onChange?.(clean);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsManualInput(false);
    onChange?.("");
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={internalId}
          className="block text-body-sm font-semibold text-foreground"
        >
          {label}{" "}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
      )}

      {/* Input / Trigger */}
      <div className="relative">
        <button
          id={internalId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "focus-ring flex h-11 w-full items-center justify-between rounded-control border border-input bg-card px-4 text-left text-body text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger",
            isOpen && "border-primary ring-2 ring-primary/20",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {selectedBank ? (
              <>
                {selectedBank.logoUrl && (
                  <img
                    src={selectedBank.logoUrl}
                    alt={selectedBank.shortName}
                    className="h-6 w-auto max-w-[48px] object-contain"
                    onError={(e) => {
                      // Ẩn logo nếu link ảnh gặp lỗi
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-bold text-foreground">
                    {selectedBank.shortName}
                  </span>
                  <span className="ml-2 text-caption text-muted-foreground">
                    ({selectedBank.bin}) - {selectedBank.name}
                  </span>
                </div>
              </>
            ) : value ? (
              <span className="font-mono font-medium text-foreground">
                Mã BIN: {value}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Chọn ngân hàng nhận tiền...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pl-2 text-muted-foreground">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 hover:text-foreground"
                title="Xóa lựa chọn"
              >
                <X size={16} />
              </span>
            )}
            <ChevronDown
              size={18}
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full overflow-hidden rounded-control border border-border bg-card shadow-raised">
            {/* Thanh tìm kiếm */}
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm theo tên ngân hàng, mã viết tắt (MB, VCB...) hoặc BIN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-control bg-muted/50 pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Danh sách ngân hàng */}
            <ul
              role="listbox"
              className="max-h-56 overflow-y-auto p-1 text-body-sm"
            >
              {filteredBanks.length === 0 ? (
                <li className="p-4 text-center text-caption text-muted-foreground">
                  Không tìm thấy ngân hàng phù hợp.
                </li>
              ) : (
                filteredBanks.map((bank) => {
                  const isSelected = value === bank.bin;
                  return (
                    <li
                      key={bank.bin}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectBank(bank)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-control px-3 py-2 transition-colors hover:bg-muted/70",
                        isSelected && "bg-primary/10 text-primary-strong",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        {bank.logoUrl && (
                          <div className="flex h-6 w-12 items-center justify-center bg-white p-0.5 rounded">
                            <img
                              src={bank.logoUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold leading-tight">
                            {bank.shortName}{" "}
                            <span className="font-mono text-caption text-muted-foreground">
                              ({bank.bin})
                            </span>
                          </p>
                          <p className="truncate text-caption text-muted-foreground">
                            {bank.name}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-primary shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Mục nhập mã BIN thủ công */}
            <div className="border-t border-border bg-muted/30 p-2 text-caption">
              {isManualInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã BIN (VD: 970422)"
                    value={manualBin}
                    onChange={(e) =>
                      setManualBin(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="h-8 flex-1 rounded border border-input bg-card px-2 text-caption text-foreground"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className="h-8 rounded bg-primary px-3 font-semibold text-primary-foreground hover:bg-primary-hover"
                  >
                    Xác nhận
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsManualInput(true)}
                  className="w-full text-center text-caption font-medium text-primary hover:underline"
                >
                  Không tìm thấy ngân hàng của bạn? Nhập mã BIN thủ công
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-caption font-semibold text-danger">{error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export default BankSelect;
