/**
 * ============================================================
 * request.js — 独立异步请求工具
 * ============================================================
 *
 * 特性:
 *  - 基于 fetch API，零外部依赖
 *  - 请求/响应拦截器链
 *  - 自动 JSON 解析
 *  - 超时控制
 *  - 统一错误格式
 *  - Mock 模式开关（开发时自动拦截）
 *
 * 使用示例:
 *   import request from '@/utils/request';
 *   const data = await request.get('/api/products', { page: 1 });
 *   const result = await request.post('/api/orders', { userId: 1 });
 */

// ---- 配置 ----
const CONFIG = {
  baseURL: '',            // API 根路径
  timeout: 15000,         // 超时时间(ms)
  headers: {
    'Content-Type': 'application/json',
  },
  mockMode: false,        // 是否启用 Mock 模式
};

// ---- 拦截器链 ----
// 每个拦截器是 { request?, response?, error? } 对象
const interceptors = [];

// ---- 工具函数 ----

/** 将对象转为 URL query string */
function toQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

/** 拼接完整 URL */
function buildURL(url, params) {
  const full = (CONFIG.baseURL || '') + url;
  return full + toQueryString(params);
}

/** 带超时的 fetch */
function fetchWithTimeout(url, options, timeout) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new RequestError('请求超时', 408));
    }, timeout);

    fetch(url, { ...options, signal: controller.signal })
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          reject(new RequestError('请求超时', 408));
        } else {
          reject(new RequestError(err.message || '网络错误', 0));
        }
      });
  });
}

// ---- 自定义错误类 ----
class RequestError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.data = data;
  }
}

// ---- 核心请求类 ----
class Request {
  constructor() {
    // 请求计数器（用于调试，显示第几次请求）
    this.requestCount = 0;
  }

  /** 执行一次 HTTP 请求 */
  async execute(method, url, data = null, options = {}) {
    this.requestCount++;

    const reqConfig = {
      method: method.toUpperCase(),
      url,
      data,
      params: options.params || {},
      headers: { ...CONFIG.headers, ...options.headers },
      timeout: options.timeout || CONFIG.timeout,
    };

    // 1. 运行请求拦截器
    let finalConfig = { ...reqConfig };
    for (const inter of interceptors) {
      if (inter.request) {
        finalConfig = await inter.request(finalConfig);
      }
    }

    // 2. 构建 fetch options
    const fetchOptions = {
      method: finalConfig.method,
      headers: finalConfig.headers,
    };

    if (finalConfig.data && ['POST', 'PUT', 'PATCH'].includes(finalConfig.method)) {
      fetchOptions.body = JSON.stringify(finalConfig.data);
    }

    // 3. 发起请求
    const fullURL = buildURL(finalConfig.url, finalConfig.params);
    let response;
    try {
      response = await fetchWithTimeout(fullURL, fetchOptions, finalConfig.timeout);
    } catch (err) {
      // 运行错误拦截器
      for (const inter of interceptors) {
        if (inter.error) {
          await inter.error(err);
        }
      }
      throw err;
    }

    // 4. 解析响应
    let result;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    // 5. 检查 HTTP 状态
    if (!response.ok) {
      const error = new RequestError(
        result?.message || `请求失败 (${response.status})`,
        response.status,
        result
      );
      for (const inter of interceptors) {
        if (inter.error) await inter.error(error);
      }
      throw error;
    }

    // 6. 运行响应拦截器
    let finalResult = result;
    for (const inter of interceptors) {
      if (inter.response) {
        finalResult = await inter.response(finalResult);
      }
    }

    return finalResult;
  }

  /** GET 请求 */
  get(url, params = {}, options = {}) {
    return this.execute('GET', url, null, { ...options, params });
  }

  /** POST 请求 */
  post(url, data = {}, options = {}) {
    return this.execute('POST', url, data, options);
  }

  /** PUT 请求 */
  put(url, data = {}, options = {}) {
    return this.execute('PUT', url, data, options);
  }

  /** DELETE 请求 */
  delete(url, params = {}, options = {}) {
    return this.execute('DELETE', url, null, { ...options, params });
  }
}

// ---- 对外 API ----

/** 创建请求实例 */
function createRequest(customConfig = {}) {
  Object.assign(CONFIG, customConfig);
  return new Request();
}

/** 添加拦截器，返回移除函数 */
function addInterceptor(interceptor) {
  interceptors.push(interceptor);
  return () => {
    const idx = interceptors.indexOf(interceptor);
    if (idx >= 0) interceptors.splice(idx, 1);
  };
}

/** 开启 Mock 模式 */
function enableMock() {
  CONFIG.mockMode = true;
}

/** 关闭 Mock 模式 */
function disableMock() {
  CONFIG.mockMode = false;
}

// ---- 默认导出单例 ----
// 配置 baseURL 指向后端代理
CONFIG.baseURL = '/api';

const request = new Request();

// 默认请求拦截器: 附加 JWT Token
addInterceptor({
  request(config) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

// 默认响应拦截器: 处理 401 未授权
addInterceptor({
  error(err) {
    if (err.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
  },
});

export default request;
export { createRequest, addInterceptor, enableMock, disableMock, RequestError };
