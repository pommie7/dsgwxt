/**
 * 商品 API
 * 支持真实 API 调用 + Mock 数据自动降级
 */
import request from '../utils/request';
import { getProducts as mockGetProducts, getProductById as mockGetProductById } from '../utils/mock';

// 可通过 URL 参数 ?mock=1 强制使用 Mock
const USE_MOCK =
  new URLSearchParams(window.location.search).get('mock') === '1' ||
  // 开发模式下默认尝试真实 API，失败后降级到 Mock
  false;

/**
 * 获取商品列表（分页 + 分类筛选 + 关键词搜索）
 *
 * @param {Object} params
 * @param {number} params.page     - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.category - 分类
 * @param {string} params.keyword  - 关键词
 * @returns {Promise<Object>} { code, data: { list, pagination } }
 */
export async function listProducts(params = {}) {
  if (USE_MOCK) {
    return mockGetProducts(params);
  }
  // 尝试真实 API
  try {
    return await request.get('/products', params);
  } catch (err) {
    // 网络不通则自动降级到 Mock
    console.warn('[API] 无法连接后端，自动切换到 Mock 数据', err.message);
    return mockGetProducts(params);
  }
}

/**
 * 获取商品详情（含促销信息）
 */
export async function getProduct(id) {
  if (USE_MOCK) {
    return mockGetProductById(id);
  }
  try {
    return await request.get(`/products/${id}`);
  } catch (err) {
    console.warn('[API] 无法连接后端，自动切换到 Mock 数据', err.message);
    return mockGetProductById(id);
  }
}
