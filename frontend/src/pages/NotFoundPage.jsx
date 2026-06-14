import { Link, useLocation } from 'react-router-dom';

/**
 * 404 页面 — 访问不存在的路径时自动跳转
 */
export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="empty-state" style={{ padding: '80px 20px' }}>
      <div className="icon" style={{ fontSize: 80 }}>🔍</div>
      <h1 style={{ fontSize: 48, color: '#b2bec3', marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: 16, color: '#636e72', marginBottom: 4 }}>
        抱歉，页面不存在
      </p>
      <p style={{ fontSize: 13, color: '#b2bec3', marginBottom: 28 }}>
        路径: <code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>{location.pathname}</code>
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link
          to="/"
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #0984e3, #6c5ce7)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          返回首页
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
          浏览商品
        </Link>
      </div>
    </div>
  );
}
