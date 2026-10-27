import { forwardRef } from "react";
import { Card } from "./Card";
import { formatVND } from "../../../utils/currencyFormat";
import { cn } from "../../../utils/cn";

export interface QRCodeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  qrSrc?: string;           
  loading?: boolean;        
  amount: number;           
  receiverName: string;
  bankName?: string;
  accountNo?: string;       
  note?: string;            
  onImageError?: () => void;
  hasError?: boolean;
}

export const QRCodeDisplay = forwardRef<HTMLDivElement, QRCodeDisplayProps>(
  ({ className, qrSrc, loading, amount, receiverName, bankName, accountNo, note, onImageError, hasError, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("max-w-xs mx-auto text-center overflow-hidden", className)} padding="none" {...props}>
        <div className="bg-[#f05a32] p-4 text-white text-center">
          <p className="text-[14px] opacity-90 mb-1">Thanh toán cho</p>
          <p className="font-bold text-[18px] leading-tight">{receiverName}</p>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="size-48 bg-white border border-[#eadfd8] rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            ) : hasError || !qrSrc ? (
              <div className="text-center p-4">
                <p className="text-[#f05a32] font-bold text-[14px] mb-1">Không tải được mã QR</p>
                <p className="text-[#756761] text-[12px]">Vui lòng chuyển khoản thủ công</p>
              </div>
            ) : (
              <img 
                src={qrSrc} 
                alt="Mã QR Thanh toán" 
                className="w-full h-full object-contain"
                onError={onImageError}
              />
            )}
          </div>
          
          <div className="space-y-3 w-full text-left">
            <div className="flex justify-between items-baseline">
              <span className="text-[13px] text-[#756761]">Số tiền</span>
              <span className="text-[20px] font-bold text-[#f05a32]">{formatVND(amount)}đ</span>
            </div>
            {bankName && (
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-[#756761]">Ngân hàng</span>
                <span className="text-[14px] font-bold text-[#261b17]">{bankName}</span>
              </div>
            )}
            {accountNo && (
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-[#756761]">Số tài khoản</span>
                <span className="text-[14px] font-bold text-[#261b17]">
                  {hasError ? accountNo : `•••• ${accountNo.slice(-4)}`}
                </span>
              </div>
            )}
            {note && (
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] text-[#756761]">Nội dung</span>
                <span className="text-[14px] font-bold text-[#261b17] text-right break-words max-w-[60%]">{note}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }
);
QRCodeDisplay.displayName = "QRCodeDisplay";
