import { useState, useEffect, useRef, useCallback } from 'react';
import { listProducts } from '../api/products';
import { getMockRequestCount, resetMockRequestCount } from '../utils/mock';
import { formatPrice } from '../utils/helpers';

/** 所有可用分类 */
const CATEGORIES = ['', '手机数码', '电脑办公', '家用电器'];
const CATEGORY_LABELS = { '': '全部分类', '手机数码': '手机数码', '电脑办公': '电脑办公', '家用电器': '家用电器' };

export default function ProductsPage() {
  // ---- 状态 ----
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: 12 });
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 请求统计
  const [requestLog, setRequestLog] = useState([]);
  const requestSeqRef = useRef(0);

  // 当前请求 AbortController（用于取消重复请求）
  const abortRef = useRef(null);

  // ---- 核心：分页查询（每页一次独立请求） ----
  const fetchPage = useCallback(async (page, cat, kw) => {
    // 取消上一次未完成的请求
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const seq = ++requestSeqRef.current;
    const startTime = Date.now();

    setLoading(true);
    setError('');

    // 记录发起的请求
    setRequestLog((prev) => [
      ...prev.slice(-9), // 保留最近10条
      { seq, page, category: cat, keyword: kw, status: 'pending', time: new Date().toLocaleTimeString() },
    ]);

    try {
      const res = await listProducts({ page, pageSize: 12, category: cat, keyword: kw });

      const elapsed = Date.now() - startTime;

      // 更新请求日志
      setRequestLog((prev) =>
        prev.map((r) => (r.seq === seq ? { ...r, status: 'ok', elapsed, count: res.data.list.length } : r))
      );

      setProducts(res.data.list);
      setPagination({
        page: res.data.pagination.page,
        pageSize: res.data.pagination.pageSize,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      if (err.name === 'AbortError') return; // 请求被取消，忽略

      const elapsed = Date.now() - startTime;
      setRequestLog((prev) =>
        prev.map((r) => (r.seq === seq ? { ...r, status: 'fail', elapsed } : r))
      );
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- 分类变化 → 重新请求第1页 ----
  useEffect(() => {
    fetchPage(1, category, keyword);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 搜索 ----
  const handleSearch = () => fetchPage(1, category, keyword);

  // ---- 翻页（触发新的独立请求） ----
  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPage(page, category, keyword);
  };

  // ---- 重置 Mock 计数（组件卸载时） ----
  useEffect(() => {
    resetMockRequestCount();
    return () => resetMockRequestCount();
  }, []);

  // ---- 渲染 ----
  return (
    <div>
      {/* 页头 */}
      <div className="page-header">
        <h2>🛍️ 商品列表</h2>
        <span style={{ fontSize: 13, color: '#636e72' }}>
          共 {pagination.total} 件商品
        </span>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
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

      {/* 错误提示 */}
      {error && (
        <div className="error-msg" style={{ marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* 商品列表 */}
      {loading ? (
        <div className="loading">
          <span className="spinner" />
          加载中... (第 {pagination.page} 页)
        </div>
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

          {/* 分页器 —— 每次点击触发一次独立请求 */}
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
            loading={loading}
          />
        </>
      )}

      {/* 请求日志面板（开发调试用） */}
      <RequestLogPanel logs={requestLog} currentPage={pagination.page} />
    </div>
  );
}

// ==================== 子组件 ====================

/** 分页栏 —— 每页一次请求 */
function PaginationBar({ page, totalPages, onPageChange, loading }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
        ◀ 上一页
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span style={{ color: '#b2bec3' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          disabled={loading}
          style={
            p === page
              ? { background: '#0984e3', color: '#fff', fontWeight: 700, borderColor: '#0984e3' }
              : { background: '#fff' }
          }
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: '#b2bec3' }}>…</span>}
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)}>
        下一页 ▶
      </button>

      <span style={{ fontSize: 12, color: '#b2bec3', marginLeft: 12 }}>
        每页 12 条 · 每次翻页发送一次独立请求
      </span>
    </div>
  );
}

/** 请求日志面板 */
function RequestLogPanel({ logs, currentPage }) {
  if (logs.length === 0) return null;

  return (
    <details style={{ marginTop: 24, background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
      <summary style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#636e72' }}>
        📡 请求日志 (最近 {logs.length} 次 · Mock 总计 {getMockRequestCount()} 次)
        <span style={{ fontSize: 11, color: '#b2bec3', marginLeft: 8 }}>
          每次翻页/筛选 = 一次独立请求
        </span>
      </summary>
      <table style={{ width: '100%', marginTop: 8, fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dfe6e9', textAlign: 'left', color: '#636e72' }}>
            <th style={{ padding: '4px 8px' }}>序号</th>
            <th style={{ padding: '4px 8px' }}>目标页</th>
            <th style={{ padding: '4px 8px' }}>分类</th>
            <th style={{ padding: '4px 8px' }}>关键词</th>
            <th style={{ padding: '4px 8px' }}>状态</th>
            <th style={{ padding: '4px 8px' }}>耗时</th>
            <th style={{ padding: '4px 8px' }}>返回条数</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.seq}
              style={{
                borderBottom: '1px solid #f0f0f0',
                background: log.page === currentPage ? '#dfe6e9' : 'transparent',
              }}
            >
              <td style={{ padding: '4px 8px' }}>#{log.seq}</td>
              <td style={{ padding: '4px 8px', fontWeight: log.page === currentPage ? 700 : 400 }}>
                第 {log.page} 页
              </td>
              <td style={{ padding: '4px 8px' }}>{log.category || '全部'}</td>
              <td style={{ padding: '4px 8px' }}>{log.keyword || '-'}</td>
              <td style={{ padding: '4px 8px' }}>
                {log.status === 'pending' && '⏳'}
                {log.status === 'ok' && '✅'}
                {log.status === 'fail' && '❌'}
              </td>
              <td style={{ padding: '4px 8px' }}>
                {log.elapsed != null ? `${log.elapsed}ms` : '-'}
              </td>
              <td style={{ padding: '4px 8px' }}>{log.count ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
