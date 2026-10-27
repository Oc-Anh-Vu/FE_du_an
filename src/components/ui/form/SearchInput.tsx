import { forwardRef, useState } from "react";
import { Input, type InputProps } from "./Input";
import { cn } from "../../../utils/cn";

export interface SearchInputProps extends Omit<InputProps, "type"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, defaultValue, onChange, onKeyDown, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState<string>(() =>
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ""
    );

    const currentValue = value !== undefined ? String(value) : internalValue;

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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" && currentValue) {
        event.preventDefault();
        handleClear();
      }
      onKeyDown?.(event);
    };

    const hasValue = currentValue.length > 0;

    return (
      <Input
        ref={ref}
        type="search"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        leftIcon={SearchIcon}
        rightIcon={hasValue ? (
          <button
            type="button"
            onClick={handleClear}
            className={cn("focus-ring flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground")}
            aria-label="Xóa từ khóa"
            disabled={props.disabled}
          >
            <span aria-hidden="true">{ClearIcon}</span>
          </button>
        ) : undefined}
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";
