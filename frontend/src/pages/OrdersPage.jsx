import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listOrders } from '../api/orders';
import { useAuth } from '../store/authContext';
import { formatPrice, formatDate, ORDER_STATUS_MAP, getStatusClass } from '../utils/helpers';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders(1);
  }, [isAuthenticated, status]);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const res = await listOrders({ page, pageSize: 10, status });
      setOrders(res.data.list);
      setPagination(res.data.pagination);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <div className="page-header">
        <h2>📋 我的订单</h2>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>暂无订单</p>
        </div>
      ) : (
        <>
          <div className="order-list">
            {orders.map((order) => (
              <Link
                to={`/orders/${order.id}`}
                key={order.id}
                className="order-card"
                style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
              >
                <div className="order-header">
                  <span className="order-no">订单号: {order.order_no}</span>
                  <span className={getStatusClass(order.status)}>
                    {ORDER_STATUS_MAP[order.status] || order.status}
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span style={{ fontSize: 13, color: '#636e72', fontWeight: 400 }}>
                    {formatDate(order.created_at)}
                  </span>
                  <span>合计: {formatPrice(order.total_amount)}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
            >
              上一页
            </button>
            <span className="current">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
