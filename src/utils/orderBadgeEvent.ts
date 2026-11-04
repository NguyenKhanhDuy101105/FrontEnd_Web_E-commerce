const ORDER_UNREAD_KEY = "urbanmart_has_unread_order_update";
const EVENT_NAME = "urbanmart_order_badge_updated";

export const orderBadgeManager = {
  // Đánh dấu có cập nhật mới (khi đặt hàng thành công hoặc nhận thông báo đổi trạng thái)
  setHasUnread: () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ORDER_UNREAD_KEY, "true");
    window.dispatchEvent(new Event(EVENT_NAME));
  },

  // Đã xem - Xóa chấm đỏ
  clearUnread: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ORDER_UNREAD_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  },

  // Lấy trạng thái hiện tại
  getHasUnread: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ORDER_UNREAD_KEY) === "true";
  },

  // Đăng ký lắng nghe sự kiện
  subscribe: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(EVENT_NAME, callback);
    return () => window.removeEventListener(EVENT_NAME, callback);
  },
};
