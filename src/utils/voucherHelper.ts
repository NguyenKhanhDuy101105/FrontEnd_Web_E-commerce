import { CustomerVoucherItem } from "@/src/services/customer/voucherService";

/**
 * Kiểm tra xem Voucher có thể áp dụng cho người dùng & đơn hàng hiện tại hay không
 */
export const isVoucherEligible = (
  voucher: CustomerVoucherItem,
  orderAmount: number,
): boolean => {
  // 1. Nếu backend đã tính toán và trả về flag canApply
  if (voucher.canApply !== undefined && voucher.canApply !== null) {
    // Nếu có minOrderAmount mà đơn hàng chưa đủ thì vẫn coi như chưa eligible đối với giá trị đơn hiện tại
    if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
      return false;
    }
    return voucher.canApply;
  }

  // 2. Kiểm tra nếu người dùng đã dùng hết lượt cá nhân
  if (voucher.usedByCurrentUser === true) {
    return false;
  }

  if (
    voucher.userLimit !== undefined &&
    voucher.userLimit !== null &&
    voucher.userUsageCount !== undefined &&
    voucher.userUsageCount !== null &&
    voucher.userUsageCount >= voucher.userLimit
  ) {
    return false;
  }

  // 3. Kiểm tra điều kiện đơn hàng tối thiểu
  if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
    return false;
  }

  // 4. Kiểm tra trạng thái Voucher
  if (voucher.status && voucher.status !== "AVAILABLE") {
    return false;
  }

  return voucher.isActive;
};

/**
 * Tính số tiền giảm giá thực tế của một Voucher dựa trên đơn hàng
 */
export const calculateVoucherDiscount = (
  voucher: CustomerVoucherItem,
  orderAmount: number,
): number => {
  // Nếu voucher không đủ điều kiện áp dụng -> Số tiền giảm = 0
  if (!isVoucherEligible(voucher, orderAmount)) {
    return 0;
  }

  if (voucher.discountType === "PERCENT") {
    const calculated = (orderAmount * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount && calculated > voucher.maxDiscountAmount) {
      return voucher.maxDiscountAmount;
    }
    return calculated;
  }

  return voucher.discountValue;
};

/**
 * Tự động chọn Voucher có số tiền giảm cao nhất mà đơn hàng đủ điều kiện
 */
export const getBestVoucher = (
  vouchers: CustomerVoucherItem[],
  orderAmount: number,
): CustomerVoucherItem | null => {
  let bestVoucher: CustomerVoucherItem | null = null;
  let maxDiscount = 0;

  for (const voucher of vouchers) {
    const discount = calculateVoucherDiscount(voucher, orderAmount);
    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestVoucher = voucher;
    }
  }

  return bestVoucher;
};
