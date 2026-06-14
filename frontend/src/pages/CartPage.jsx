import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/helpers';

/**
 * ============================================================
 * CartPage — 购物车页面
 * ============================================================
 *
 * 功能:
 *   ✅ 展示购物车商品列表
 *   ✅ 修改数量 (加减按钮)
 *   ✅ 删除单个商品
 *   ✅ 显示总件数 + 总金额
 *   ✅ 清空购物车按钮
 *   ✅ 去结算 → 跳转下单成功页
 */
export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const totalCount = useCartStore((s) => s.totalCount);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const isEmpty = useCartStore((s) => s.isEmpty);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const navigate = useNavigate();

  // 下单 → 跳转成功页
  const handleCheckout = () => {
    if (isEmpty) return;
    const orderNo = 'ORD' + Date.now().toString(36).toUpperCase();
    navigate(`/order-success?orderNo=${orderNo}&amount=${totalPrice.toFixed(2)}`);
  };

  return (
    <div>
      <div className="page-header">
        <h2>🛒 购物车</h2>
        <span style={{ fontSize: 13, color: '#636e72' }}>
          {isEmpty ? '空空如也' : `共 ${totalCount} 件商品`}
        </span>
      </div>

      {/* 空购物车 */}
      {isEmpty ? (
        <div className="empty-state">
          <div className="icon" style={{ fontSize: 64 }}>🛒</div>
          <p>购物车是空的</p>
          <Link
            to="/products"
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
              color: '#fff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          {/* 购物车表格 */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              marginBottom: 20,
            }}
          >
            {/* 表头 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1.2fr 1fr 0.5fr',
                gap: 12,
                padding: '12px 20px',
                background: '#f8f9fa',
                fontSize: 12,
                fontWeight: 600,
                color: '#636e72',
                borderBottom: '2px solid #dfe6e9',
              }}
            >
              <span>商品名称</span>
              <span>单价</span>
              <span style={{ textAlign: 'center' }}>数量</span>
              <span style={{ textAlign: 'right' }}>小计</span>
              <span></span>
            </div>

            {/* 商品行 */}
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1.2fr 1fr 0.5fr',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: '1px solid #f0f0f0',
                  alignItems: 'center',
                  fontSize: 14,
                }}
              >
                {/* 商品名 */}
                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    style={{ color: '#2d3436', fontWeight: 500 }}
                  >
                    {item.name}
                  </Link>
                </div>

                {/* 单价 */}
                <span style={{ color: '#636e72' }}>{formatPrice(item.price)}</span>

                {/* 数量控制 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: '#dfe6e9', border: 'none', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: '#0984e3', color: '#fff', border: 'none', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* 小计 */}
                <span style={{ textAlign: 'right', fontWeight: 600, color: '#d63031' }}>
                  {formatPrice(item.subtotal)}
                </span>

                {/* 删除按钮 */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#b2bec3',
                    padding: 4,
                  }}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* 底部操作栏 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              borderRadius: 12,
              padding: '16px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {/* 清空购物车按钮 */}
            <button
              onClick={clearCart}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#d63031',
                border: '1px solid #d63031',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🗑️ 清空购物车
            </button>

            {/* 合计 + 结算 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#b2bec3' }}>
                  共 {totalCount} 件商品
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#d63031' }}>
                  合计: {formatPrice(totalPrice)}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                style={{
                  padding: '12px 36px',
                  background: 'linear-gradient(135deg, #d63031, #e17055)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                去结算
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
