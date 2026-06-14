import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
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
