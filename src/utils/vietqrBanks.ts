// Danh sách ngân hàng chuẩn Napas/VietQR phục vụ việc chọn ngân hàng và sinh mã VietQR
export interface VietQRBank {
  bin: string;
  shortName: string;
  name: string;
  code: string;
  logoUrl?: string;
}

export const VIETQR_BANKS: VietQRBank[] = [
  {
    bin: '970422',
    shortName: 'MBBank',
    code: 'MB',
    name: 'Ngân hàng TMCP Quân Đội',
    logoUrl: 'https://api.vietqr.io/img/MB.png',
  },
  {
    bin: '970436',
    shortName: 'Vietcombank',
    code: 'VCB',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/VCB.png',
  },
  {
    bin: '970415',
    shortName: 'VietinBank',
    code: 'CTG',
    name: 'Ngân hàng TMCP Công Thương Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/ICB.png',
  },
  {
    bin: '970418',
    shortName: 'BIDV',
    code: 'BIDV',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/BIDV.png',
  },
  {
    bin: '970407',
    shortName: 'Techcombank',
    code: 'TCB',
    name: 'Ngân hàng TMCP Kỹ Thương Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/TCB.png',
  },
  {
    bin: '970416',
    shortName: 'ACB',
    code: 'ACB',
    name: 'Ngân hàng TMCP Á Châu',
    logoUrl: 'https://api.vietqr.io/img/ACB.png',
  },
  {
    bin: '970432',
    shortName: 'VPBank',
    code: 'VPB',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    logoUrl: 'https://api.vietqr.io/img/VPB.png',
  },
  {
    bin: '970423',
    shortName: 'TPBank',
    code: 'TPB',
    name: 'Ngân hàng TMCP Tiên Phong',
    logoUrl: 'https://api.vietqr.io/img/TPB.png',
  },
  {
    bin: '970405',
    shortName: 'Agribank',
    code: 'VBA',
    name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn VN',
    logoUrl: 'https://api.vietqr.io/img/VBA.png',
  },
  {
    bin: '970403',
    shortName: 'Sacombank',
    code: 'STB',
    name: 'Ngân hàng TMCP Sài Gòn Thương Tín',
    logoUrl: 'https://api.vietqr.io/img/STB.png',
  },
  {
    bin: '970441',
    shortName: 'VIB',
    code: 'VIB',
    name: 'Ngân hàng TMCP Quốc tế Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/VIB.png',
  },
  {
    bin: '970437',
    shortName: 'HDBank',
    code: 'HDB',
    name: 'Ngân hàng TMCP Phát triển TP.HCM',
    logoUrl: 'https://api.vietqr.io/img/HDB.png',
  },
  {
    bin: '970443',
    shortName: 'SHB',
    code: 'SHB',
    name: 'Ngân hàng TMCP Sài Gòn - Hà Nội',
    logoUrl: 'https://api.vietqr.io/img/SHB.png',
  },
  {
    bin: '970448',
    shortName: 'OCB',
    code: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông',
    logoUrl: 'https://api.vietqr.io/img/OCB.png',
  },
  {
    bin: '970426',
    shortName: 'MSB',
    code: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/MSB.png',
  },
  {
    bin: '970440',
    shortName: 'SeABank',
    code: 'SEAB',
    name: 'Ngân hàng TMCP Đông Nam Á',
    logoUrl: 'https://api.vietqr.io/img/SEAB.png',
  },
  {
    bin: '970449',
    shortName: 'LPBank',
    code: 'LPB',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/LPB.png',
  },
  {
    bin: '970431',
    shortName: 'Eximbank',
    code: 'EIB',
    name: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/EIB.png',
  },
  {
    bin: '970428',
    shortName: 'Nam A Bank',
    code: 'NAB',
    name: 'Ngân hàng TMCP Nam Á',
    logoUrl: 'https://api.vietqr.io/img/NAB.png',
  },
  {
    bin: '970409',
    shortName: 'Bac A Bank',
    code: 'BAB',
    name: 'Ngân hàng TMCP Bắc Á',
    logoUrl: 'https://api.vietqr.io/img/BAB.png',
  },
  {
    bin: '970412',
    shortName: 'PVcomBank',
    code: 'PVCB',
    name: 'Ngân hàng TMCP Đại Chúng Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/PVCB.png',
  },
  {
    bin: '970454',
    shortName: 'BVBank',
    code: 'BVB',
    name: 'Ngân hàng TMCP Bản Việt',
    logoUrl: 'https://api.vietqr.io/img/BVB.png',
  },
  {
    bin: '970424',
    shortName: 'Shinhan Bank',
    code: 'SHBVN',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/SHBVN.png',
  },
  {
    bin: '970457',
    shortName: 'Woori Bank',
    code: 'Wooribank',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/Wooribank.png',
  },
  {
    bin: '546034',
    shortName: 'Cake by VPBank',
    code: 'CAKE',
    name: 'Ngân hàng số Cake by VPBank',
    logoUrl: 'https://api.vietqr.io/img/CAKE.png',
  },
  {
    bin: '963388',
    shortName: 'Timo',
    code: 'TIMO',
    name: 'Ngân hàng số Timo by BVBank',
    logoUrl: 'https://api.vietqr.io/img/TIMO.png',
  },
  {
    bin: '971005',
    shortName: 'Viettel Money',
    code: 'VTLMONEY',
    name: 'Tổng Công ty Dịch vụ Số Viettel',
    logoUrl: 'https://api.vietqr.io/img/VIETTELMONEY.png',
  },
  {
    bin: '971011',
    shortName: 'VNPT Money',
    code: 'VNPTMONEY',
    name: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
    logoUrl: 'https://api.vietqr.io/img/VNPTMONEY.png',
  },
  {
    bin: '970438',
    shortName: 'BaoViet Bank',
    code: 'BVBANK',
    name: 'Ngân hàng TMCP Bảo Việt',
    logoUrl: 'https://api.vietqr.io/img/BVBANK.png',
  },
  {
    bin: '970452',
    shortName: 'Kienlongbank',
    code: 'KLB',
    name: 'Ngân hàng TMCP Kiên Long',
    logoUrl: 'https://api.vietqr.io/img/KLB.png',
  },
  {
    bin: '970433',
    shortName: 'VietBank',
    code: 'VBB',
    name: 'Ngân hàng TMCP Việt Nam Thương Tín',
    logoUrl: 'https://api.vietqr.io/img/VBB.png',
  },
  {
    bin: '970400',
    shortName: 'Saigonbank',
    code: 'SGB',
    name: 'Ngân hàng TMCP Sài Gòn Công Thương',
    logoUrl: 'https://api.vietqr.io/img/SGB.png',
  },
];

/**
 * Tìm ngân hàng theo mã BIN
 */
export function getBankByBin(bin?: string | null): VietQRBank | undefined {
  if (!bin) return undefined;
  const cleanBin = bin.trim();
  return VIETQR_BANKS.find((b) => b.bin === cleanBin);
}

/**
 * Tìm kiếm ngân hàng theo từ khóa (tên viết tắt, tên đầy đủ, mã BIN)
 */
export function searchBanks(keyword: string): VietQRBank[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return VIETQR_BANKS;

  return VIETQR_BANKS.filter(
    (b) =>
      b.shortName.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.bin.includes(q),
  );
}

/**
 * Chuẩn hóa tên chủ tài khoản ngân hàng: viết hoa, loại bỏ dấu tiếng Việt
 * VD: "Nguyễn Văn An" -> "NGUYEN VAN AN"
 */
export function normalizeAccountName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

/**
 * Sinh link ảnh VietQR chuẩn
 */
export function buildVietQRUrl(
  bankBin: string,
  bankAccountNumber: string,
  accountName?: string | null,
  amount: number = 50000,
  addInfo: string = 'Demo Hom Nay An Gi',
): string {
  const bin = encodeURIComponent(bankBin.trim());
  const accNum = encodeURIComponent(bankAccountNumber.trim());
  const name = encodeURIComponent(
    accountName ? normalizeAccountName(accountName) : 'NGUOI NHAN',
  );
  const info = encodeURIComponent(addInfo);
  return `https://img.vietqr.io/image/${bin}-${accNum}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}

