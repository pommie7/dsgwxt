import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { useCartStore } from '../store/cartStore';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const totalCount = useCartStore((s) => s.totalCount);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="app-header">
        <Link to="/" className="logo">🛒 电商购物平台</Link>
        <nav>
          <Link to="/products">商品列表</Link>

          {/* 购物车图标 + 数量角标 */}
          <Link to="/cart" style={{ position: 'relative' }}>
            🛒 购物车
            {totalCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -10,
                  background: '#d63031',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders">我的订单</Link>
              <span className="username">{user?.username}</span>
              <button onClick={handleLogout}>退出登录</button>
            </>
          ) : (
            <Link to="/login">登录</Link>
          )}
        </nav>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}
