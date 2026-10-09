import { forwardRef } from "react";
import { Input, type InputProps } from "./Input";

export interface SearchInputProps extends InputProps {
  onClear?: () => void;
  filterSlot?: React.ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, filterSlot, value, onChange, ...props }, ref) => {
    
    const SearchIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    );

    const ClearIcon = (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    );

    const hasValue = value !== undefined && value !== "";

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        leftIcon={SearchIcon}
        rightSlot={
          <div className="flex items-center gap-1">
            {hasValue && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="size-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors"
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
        }
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";
