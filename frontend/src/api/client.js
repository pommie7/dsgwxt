/**
 * API Client — 基于 request.js 封装
 * 向后兼容：保留与旧代码相同的接口风格
 */
import request from '../utils/request';

const client = {
  get(url, config = {}) {
    return request.get(url, config.params || {}, config);
  },
  post(url, data, config = {}) {
    return request.post(url, data, config);
  },
  put(url, data, config = {}) {
    return request.put(url, data, config);
  },
  delete(url, config = {}) {
    return request.delete(url, config.params || {}, config);
  },
};

export default client;
