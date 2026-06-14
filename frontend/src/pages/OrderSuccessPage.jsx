import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

/**
 * 下单成功页面 — 下单后跳转至此
 * 显示订单号 + 金额 + 清空购物车
 */
export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderNo = searchParams.get('orderNo') || '—';
  const amount = searchParams.get('amount') || '0';
  const clearCart = useCartStore((s) => s.clearCart);

  const [countdown, setCountdown] = useState(8);

  // 下单成功 → 自动清空购物车
  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 倒计时自动跳转
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((n) => n - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      {/* 成功图标 */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00b894, #55efc4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0,184,148,0.3)',
        }}
      >
        ✓
      </div>

      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#2d3436' }}>
        🎉 下单成功！
      </h1>
      <p style={{ fontSize: 14, color: '#636e72', marginBottom: 24 }}>
        感谢您的购买，订单正在处理中
      </p>

      {/* 订单信息卡片 */}
      <div
        style={{
          display: 'inline-block',
          background: '#fff',
          borderRadius: 12,
          padding: '20px 36px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          marginBottom: 28,
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>
          订单编号
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#2d3436', marginBottom: 16, fontFamily: 'monospace' }}>
          {orderNo}
        </div>
        <div style={{ fontSize: 13, color: '#636e72', marginBottom: 4 }}>
          支付金额
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#d63031' }}>
          ¥{Number(amount).toFixed(2)}
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        <Link
          to="/orders"
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          查看订单
        </Link>
        <Link
          to="/products"
          style={{
            padding: '10px 24px',
            background: '#fff',
            color: '#0984e3',
            border: '1px solid #0984e3',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          继续购物
        </Link>
      </div>

      <p style={{ fontSize: 12, color: '#b2bec3' }}>
        {countdown > 0 ? `${countdown} 秒后自动跳转到订单列表` : '正在跳转...'}
      </p>

      {/* 自动跳转 */}
      {countdown <= 0 && (
        <NavigateAfterDelay to="/orders" delay={0} />
      )}
    </div>
  );
}

// 延迟跳转辅助组件
import { useNavigate } from 'react-router-dom';
function NavigateAfterDelay({ to }) {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate(to, { replace: true }), 100);
    return () => clearTimeout(t);
  }, [to, navigate]);
  return null;
}
