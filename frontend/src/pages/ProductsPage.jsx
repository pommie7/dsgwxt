import { useState, useEffect } from 'react';
import { listProducts } from '../api/products';
import { formatPrice } from '../utils/helpers';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await listProducts({ page, pageSize: 12, category, keyword });
      setProducts(res.data.list);
      setPagination(res.data.pagination);
    } catch {
      // silently fail — products just stay empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [category]); // reload when category changes

  const handleSearch = () => fetchProducts(1);

  return (
    <div>
      <div className="page-header">
        <h2>🛍️ 商品列表</h2>
        <span style={{ fontSize: 13, color: '#636e72' }}>
          共 {pagination.total} 件商品
        </span>
      </div>

      <div className="filter-bar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">全部分类</option>
          <option value="手机数码">手机数码</option>
          <option value="电脑办公">电脑办公</option>
        </select>
        <input
          type="text"
          placeholder="搜索商品..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary" style={{ width: 'auto' }} onClick={handleSearch}>
          搜索
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <p>暂无商品</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <span className="category-tag">{p.category}</span>
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <div className="price">{formatPrice(p.price)}</div>
                <div className="stock">库存: {p.stock} 件</div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchProducts(pagination.page - 1)}
            >
              上一页
            </button>
            <span className="current">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchProducts(pagination.page + 1)}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
