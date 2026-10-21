import { forwardRef, useEffect, useState } from "react";
import { Input, type InputProps } from "./Input";

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
  filterSlot?: React.ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, filterSlot, value, defaultValue, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState<string>(() =>
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ""
    );

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    const SearchIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    );

    const ClearIcon = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }
      onClear?.();
    };

    const hasValue = internalValue.length > 0;
    const showRightActions = hasValue || !!filterSlot;

    return (
      <Input
        ref={ref}
        type="text"
        value={internalValue}
        onChange={handleChange}
        leftIcon={SearchIcon}
        rightSlot={
          showRightActions ? (
            <div className="flex items-center gap-1">
              {hasValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="size-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                >
                  {ClearIcon}
                </button>
              )}
              {filterSlot && (
                <div className="ml-1 pl-2 border-l border-[#eadfd8]">
                  {filterSlot}
                </div>
              )}
            </div>
          ) : undefined
        }
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";
