/**
 * ============================================================
 * PromotionTag — 促销标签子组件
 * ============================================================
 *
 * Props (父→子传值):
 *   promotion: {
 *     type: string   — 'flash_sale' | 'discount' | 'limited' | 'new_arrival'
 *     label: string  — 促销标签文字
 *     discountRate: number — 折扣率 (如 0.85 表示 85 折)
 *   }
 *
 * 不同促销类型有不同配色样式
 */
const TYPE_STYLES = {
  flash_sale: {
    bg: '#ff7675',
    color: '#fff',
    icon: '⚡',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  limited: {
    bg: '#e17055',
    color: '#fff',
    icon: '🔥',
  },
  discount: {
    bg: '#fdcb6e',
    color: '#2d3436',
    icon: '🏷️',
  },
  new_arrival: {
    bg: '#00cec9',
    color: '#fff',
    icon: '✨',
  },
};

export default function PromotionTag({ promotion }) {
  if (!promotion) return null;

  const style = TYPE_STYLES[promotion.type] || TYPE_STYLES.discount;
  const discountText =
    promotion.discountRate ? `${Math.round(promotion.discountRate * 100)}折` : '';

  return (
    <span
      className="promo-tag"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.5px',
        animation: style.animation,
        boxShadow: `0 2px 8px ${style.bg}66`,
      }}
    >
      <span>{style.icon}</span>
      <span>{promotion.label}</span>
      {discountText && <span>{discountText}</span>}
    </span>
  );
}
