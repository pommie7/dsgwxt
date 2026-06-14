/**
 * Format price to CNY string.
 */
export function formatPrice(price) {
  return `¥${Number(price).toFixed(2)}`;
}

/**
 * Format date string to locale date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Map order status to display label.
 */
export const ORDER_STATUS_MAP = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

/**
 * Get CSS class for order status.
 */
export function getStatusClass(status) {
  return `status status-${status}`;
}
