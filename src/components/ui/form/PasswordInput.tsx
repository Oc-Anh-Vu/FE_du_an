import { forwardRef, useState } from "react";
import { Input, type InputProps } from "./Input";
import { div } from "framer-motion/client";

export interface PasswordInputProps extends InputProps {
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter, value, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const toggleShow = () => setShow((prev) => !prev);

    const EyeIcon = show ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    );

    let strength = 0;
    if (typeof value === 'string') {
      if (value.length > 5) strength += 1; // Yếu (Đỏ)
      if (value.length > 8 && /[A-Z]/.test(value)) strength += 1; // Vừa (Vàng)
      if (value.length > 8 && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) strength += 1; // Mạnh (Xanh)
    }
    const strengthColors = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-green-500"];

    return (
      <div className="w-full flex flex-col gap-2">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          value={value}
          rightSlot={
            <button
              type="button"
              onClick={toggleShow}
              className="text-[#756761] hover:text-[#261b17] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05a32] rounded"
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {EyeIcon}
            </button>
          }
          {...props}
        />
        {/* Render thanh đo độ mạnh nếu prop được bật */}
        {showStrengthMeter && value && (
          <div className="flex gap-1 h-1.5 mt-1">
            <div className={`flex-1 rounded-full ${strength >= 1 ? strengthColors[strength] : 'bg-gray-200'}`} />
            <div className={`flex-1 rounded-full ${strength >= 2 ? strengthColors[strength] : 'bg-gray-200'}`} />
            <div className={`flex-1 rounded-full ${strength >= 3 ? strengthColors[strength] : 'bg-gray-200'}`} />
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
