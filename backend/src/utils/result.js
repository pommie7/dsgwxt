/**
 * ============================================================
 * 统一返回结果类 (Unified Result)
 * ============================================================
 *
 * 标准响应格式:
 *   { code: 200, message: 'success', data: ..., timestamp: '...' }
 *
 * 分页响应格式:
 *   { code: 200, message: 'success', data: [...], pagination: {...}, timestamp: '...' }
 *
 * 错误响应格式:
 *   { code: 4xx/5xx, message: '错误描述', timestamp: '...' }
 */

class Result {
  /**
   * 成功响应（带数据）
   * @param {*} data     - 响应数据
   * @param {string} msg - 提示消息
   */
  static success(data = null, msg = 'success') {
    return {
      code: 200,
      message: msg,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建成功响应
   * @param {string} msg - 提示消息
   * @param {*} data     - 响应数据
   */
  static created(data = null, msg = '创建成功') {
    return {
      code: 201,
      message: msg,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 失败响应
   * @param {number} code - HTTP 状态码
   * @param {string} msg  - 错误消息
   * @param {*} [detail]  - 错误详情（可选）
   */
  static fail(code = 500, msg = '服务器内部错误', detail = null) {
    const body = {
      code,
      message: msg,
      timestamp: new Date().toISOString(),
    };
    if (detail !== null) body.detail = detail;
    return body;
  }

  /**
   * 分页成功响应
   * @param {Array}  list       - 数据列表
   * @param {Object} pagination - { page, pageSize, total, totalPages }
   * @param {string} msg        - 提示消息
   */
  static page(list = [], pagination = {}, msg = 'success') {
    return {
      code: 200,
      message: msg,
      data: list,
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 参数校验失败响应 (422)
   * @param {string} msg    - 错误描述
   * @param {Array}  errors - 字段级错误列表 [{ field, message }]
   */
  static validationError(msg = '参数校验失败', errors = []) {
    return {
      code: 422,
      message: msg,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 资源不存在响应 (404)
   * @param {string} msg - 提示消息
   */
  static notFound(msg = '资源不存在') {
    return {
      code: 404,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 业务逻辑错误 (400)
   * @param {string} msg - 错误描述
   */
  static businessError(msg = '业务处理失败') {
    return {
      code: 400,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 未授权 (401)
   * @param {string} msg - 提示消息
   */
  static unauthorized(msg = '未授权访问') {
    return {
      code: 401,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 冲突 (409)
   * @param {string} msg - 提示消息
   */
  static conflict(msg = '资源冲突') {
    return {
      code: 409,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 服务器内部错误 (500)
   * @param {string} msg - 错误描述
   */
  static error(msg = '服务器内部错误') {
    return {
      code: 500,
      message: msg,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = Result;
