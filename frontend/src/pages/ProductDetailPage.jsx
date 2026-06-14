import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import { formatPrice } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import PromotionTag from '../components/PromotionTag';
import CountdownTimer from '../components/CountdownTimer';

/**
 * ============================================================
 * ProductDetailPage — 商品详情页（父组件）
 * ============================================================
 *
 * 父→子传值:
 *   PromotionTag  ←  promotion 对象 (type, label, discountRate)
 *   CountdownTimer ←  endTime 字符串 (促销截止时间)
 *
 * 数据流向: API/Mock → ProductDetailPage(state) → props → 子组件
 */
export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedMsg, setAddedMsg] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProduct(id);
        setProduct(res.data);
      } catch (err) {
        setError(err.message || '商品不存在');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---- 加载中 ----
  if (loading) {
    return (
      <div className="loading" style={{ padding: 60 }}>
        <span className="spinner" />
        加载中...
      </div>
    );
  }

  // ---- 错误 ----
  if (error || !product) {
    return (
      <div className="empty-state">
        <div className="icon">🔍</div>
        <p>{error || '商品不存在'}</p>
        <Link to="/products" style={{ marginTop: 16, display: 'inline-block' }}>
          ← 返回商品列表
        </Link>
      </div>
    );
  }

  const promo = product.promotion || null;
  const promoPrice = promo
    ? (product.price * promo.discountRate).toFixed(2)
    : null;

  return (
    <div>
      {/* 面包屑 */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#b2bec3' }}>
        <Link to="/products">商品列表</Link> / {product.category} / {product.name}
      </div>

      {/* ======== 商品主信息 ======== */}
      <div
        className="product-detail-card"
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        {/* 左侧：商品图占位 */}
        <div
          style={{
            width: 300,
            height: 300,
            background: 'linear-gradient(135deg, #dfe6e9, #b2bec3)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            flexShrink: 0,
          }}
        >
          📦
        </div>

        {/* 右侧：商品信息 + 促销区 */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {/* 分类标签 */}
          <span
            style={{
              display: 'inline-block',
              background: '#dfe6e9',
              color: '#636e72',
              fontSize: 11,
              padding: '2px 10px',
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            {product.category}
          </span>

          <h1 style={{ fontSize: 24, marginBottom: 8 }}>{product.name}</h1>
          <p style={{ color: '#636e72', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            {product.description}
          </p>

          {/* ============================================
              ★ 父→子传值区域 ★
              将 promotion 对象传给 PromotionTag
              将 promotion.endTime 传给 CountdownTimer
              ============================================ */}
          {promo && (
            <div
              className="promo-area"
              style={{
                background: 'linear-gradient(135deg, #fff9e6, #ffe8e8)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                border: '1px dashed #fdcb6e',
              }}
            >
              {/* 促销标题行 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                <PromotionTag promotion={promo} />
              </div>

              {/* 价格对比 */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#b2bec3', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#d63031',
                    marginLeft: 12,
                  }}
                >
                  {formatPrice(promoPrice)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#d63031',
                    marginLeft: 8,
                    background: '#ffeaa7',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  省{formatPrice((product.price - promoPrice).toFixed(2))}
                </span>
              </div>

              {/* 倒计时 */}
              <CountdownTimer endTime={promo.endTime} />
            </div>
          )}

          {/* 无促销：正常价格 */}
          {!promo && (
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#d63031' }}>
                {formatPrice(product.price)}
              </span>
            </div>
          )}

          {/* 库存信息 */}
          <div style={{ fontSize: 13, color: '#b2bec3', marginBottom: 20 }}>
            库存: {product.stock > 0 ? `${product.stock} 件` : '暂时缺货'}
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                addItem(product, 1);
                setAddedMsg('✓ 已加入购物车');
                setTimeout(() => setAddedMsg(''), 2000);
              }}
            >
              加入购物车
            </button>
            <button
              style={{
                padding: '12px 32px',
                background: '#d63031',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                addItem(product, 1);
                navigate('/cart');
              }}
            >
              立即购买
            </button>
            {addedMsg && (
              <span style={{ color: '#00b894', fontSize: 14, fontWeight: 600 }}>
                {addedMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 数据流向说明 */}
      <details style={{ marginTop: 24, background: '#f8f9fa', borderRadius: 8, padding: 14 }}>
        <summary style={{ fontWeight: 600, fontSize: 13, color: '#636e72', cursor: 'pointer' }}>
          📋 Props 传递示意 (父→子)
        </summary>
        <div style={{ marginTop: 10, fontSize: 12, fontFamily: 'monospace', background: '#2d3436', color: '#55efc4', padding: 14, borderRadius: 6, lineHeight: 1.8, overflowX: 'auto' }}>
{`{/* ProductDetailPage (父组件) */}
<ProductDetailPage>
  │
  │  const promo = product.promotion;  // ← 来自 API/Mock
  │
  ├── <PromotionTag promotion={promo} />
  │       ├── props.promotion.type     → "flash_sale"
  │       ├── props.promotion.label    → "限时秒杀"
  │       └── props.promotion.discountRate → 0.85
  │
  └── <CountdownTimer endTime={promo.endTime} />
          └── props.endTime → "2026-06-14T14:00:00.000Z"`}
        </div>
      </details>
    </div>
  );
}
