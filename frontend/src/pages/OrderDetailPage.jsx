import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder } from '../api/orders';
import { useAuth } from '../store/authContext';
import { formatPrice, formatDate, ORDER_STATUS_MAP, getStatusClass } from '../utils/helpers';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data);
      } catch {
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isAuthenticated, navigate]);

  if (!isAuthenticated || loading) {
    return <div className="loading">{loading ? '加载中...' : ''}</div>;
  }

  if (!order) return null;

  return (
    <div>
      <div className="page-header">
        <h2>📄 订单详情</h2>
        <Link to="/orders" style={{ fontSize: 14 }}>← 返回订单列表</Link>
      </div>

      <div className="order-card" style={{ padding: 24 }}>
        <div className="order-header" style={{ marginBottom: 20 }}>
          <div>
            <span className="order-no" style={{ fontSize: 16 }}>{order.order_no}</span>
            <div style={{ fontSize: 12, color: '#b2bec3', marginTop: 4 }}>
              下单时间: {formatDate(order.created_at)}
            </div>
          </div>
          <span className={getStatusClass(order.status)} style={{ fontSize: 14 }}>
            {ORDER_STATUS_MAP[order.status] || order.status}
          </span>
        </div>

        <h4 style={{ marginBottom: 10, color: '#636e72' }}>商品信息</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#636e72' }}>
              <th style={{ padding: '8px 0' }}>商品</th>
              <th style={{ padding: '8px 0' }}>单价</th>
              <th style={{ padding: '8px 0' }}>数量</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>小计</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 0' }}>{item.product_name}</td>
                <td>{formatPrice(item.product_price)}</td>
                <td>×{item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: 'right', marginTop: 20, fontSize: 20, fontWeight: 700 }}>
          实付金额: <span style={{ color: '#d63031' }}>{formatPrice(order.total_amount)}</span>
        </div>

        {(order.receiver_name || order.receiver_address) && (
          <div style={{ marginTop: 20, padding: 14, background: '#f8f9fa', borderRadius: 8, fontSize: 13, color: '#636e72' }}>
            <strong>收货信息：</strong>
            {order.receiver_name && <span> {order.receiver_name}</span>}
            {order.receiver_phone && <span> {order.receiver_phone}</span>}
            {order.receiver_address && <div style={{ marginTop: 4 }}>{order.receiver_address}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
