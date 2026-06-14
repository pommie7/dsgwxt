# 实验报告：统一返回结果与 RESTful 商品 CRUD 接口

---

班级              姓名              学号             分数＿＿＿＿＿
课程名称 《网络编程实践》   实验日期             指导老师
实验名称 **电商统一返回结果类与 RESTful 商品增删改查接口开发**

---

## [实验任务与要求]

1. 开发电商统一返回结果类（含状态码、消息、数据、分页信息），实现全局配置
2. 基于 RESTful 规范开发商品增删改查基础接口（`/products/add`、`/delete`、`/update`、`/query`）
3. 开发全局异常处理器，处理参数错误、业务异常、接口不存在等问题
4. 编写接口测试用例，用 Postman/ApiFox 完成全覆盖测试（不同参数、异常场景）
5. 提交实验报告

---

## [实验工具]

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | v24.16.0 | 后端运行时环境 |
| Express | 4.21.0 | Web 框架 |
| sql.js | 1.10.3 | 嵌入式 SQLite 数据库 (纯 JS) |
| express-validator | 7.2.0 | 请求参数校验 |
| VS Code | 最新版 | 代码编辑器 |
| Bash + curl | — | 接口测试 (Postman 替代) |
| Git + GitHub | — | 版本控制与代码托管 |

---

## [实验分析与设计]

### 一、统一返回结果类设计

**问题分析**：原系统中各接口的 JSON 响应格式不统一——有的包含 `code`/`data`，有的只有 `status`，有的缺少 `message` 字段。这导致前端需要针对不同接口做不同的响应解析逻辑。

**解决方案**：开发 `Result` 类作为全局唯一的响应格式工厂。

```
标准成功格式:  { code: 200, message: "success", data: {...}, timestamp: "..." }
分页成功格式:  { code: 200, message: "success", data: [...], pagination: {...}, timestamp: "..." }
错误格式:      { code: 4xx/5xx, message: "错误描述", [errors: [...]], timestamp: "..." }
```

**Result 类静态方法**：

| 方法 | 用途 | HTTP 状态码 |
|------|------|-------------|
| `Result.success(data, msg)` | 成功响应 | 200 |
| `Result.created(data, msg)` | 创建成功响应 | 201 |
| `Result.page(list, pagination, msg)` | 分页成功响应 | 200 |
| `Result.fail(code, msg, detail)` | 通用失败 | 任意 |
| `Result.validationError(msg, errors)` | 参数校验失败 | 422 |
| `Result.notFound(msg)` | 资源不存在 | 404 |
| `Result.businessError(msg)` | 业务逻辑错误 | 400 |
| `Result.unauthorized(msg)` | 未授权 | 401 |
| `Result.conflict(msg)` | 资源冲突 | 409 |
| `Result.error(msg)` | 服务器内部错误 | 500 |

### 二、RESTful 商品 CRUD 接口设计

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/api/products/query` | 分页查询列表 | `?page=&pageSize=&category=&keyword=&status=` |
| GET | `/api/products/query/:id` | 按 ID 查询单个 | 路径参数 `id` |
| POST | `/api/products/add` | 新增商品 | `{ name, price, description?, stock?, category?, image_url? }` |
| PUT | `/api/products/update/:id` | 修改商品（部分更新） | 路径参数 `id` + body 任意字段 |
| DELETE | `/api/products/delete/:id` | 删除商品（软删除/下架） | 路径参数 `id` |

**关键设计决策**：

1. **删除策略**：采用软删除（`status=0` 表示下架），而非物理删除，保留数据可追溯性
2. **部分更新**：`update` 接口支持 PATCH 语义——只更新传入的字段，使用动态 SQL 拼接 `SET` 子句
3. **分类筛选**：支持按 `category` 精确匹配、按 `keyword` 模糊搜索（名称+描述）、按 `status` 筛选
4. **参数校验**：使用 `express-validator` 链式校验，新增时 `name`/`price` 必填，修改时均为可选

### 三、全局异常处理器设计

```
请求 → 路由 → 控制器
              ↓ (异常)
         errorHandler 中间件
              ↓
     ┌──────┼──────┬──────────┬──────────┐
     ▼      ▼      ▼          ▼          ▼
  ValErr  BizErr  NotFoundErr ParseErr  Unknown
  (422)   (400)   (404)       (400)     (500)
```

**自定义异常类**：
- `BusinessError(message, code)` — 抛出时携带 HTTP 状态码
- `NotFoundError(message)` — 固定 404
- `ValidationError(message, errors)` — 固定 422，携带字段级错误列表

**处理范围**：
- express-validator 校验失败 → 422
- 业务逻辑错误（如重复下架）→ 400
- 资源不存在 → 404
- JSON 解析失败 → 400
- 接口路径不存在（404 catch-all）→ 404
- 其他未知异常 → 500

---

## [实验过程]

### 步骤 1：开发统一返回结果类

文件：[`backend/src/utils/result.js`](backend/src/utils/result.js)（约 130 行）

```javascript
// 核心方法
Result.success(data, msg)           // { code: 200, message, data, timestamp }
Result.created(data, msg)           // { code: 201, message, data, timestamp }
Result.page(list, pagination, msg)  // { code: 200, data, pagination, timestamp }
Result.fail(code, msg, detail)      // { code, message, timestamp, [detail] }
Result.validationError(msg, errors) // { code: 422, message, errors, timestamp }
Result.notFound(msg)                // { code: 404, message, timestamp }
Result.businessError(msg)           // { code: 400, message, timestamp }
```

### 步骤 2：实现商品 CRUD 控制器

文件：[`backend/src/controllers/productController.js`](backend/src/controllers/productController.js)（约 170 行）

关键实现：
- `queryProducts` — 动态 WHERE 条件构建 + 分页
- `queryProductById` — 单条查询 + 404 处理
- `addProduct` — 参数解构 + INSERT + 返回新记录
- `updateProduct` — 动态 SET 子句 + 部分更新
- `deleteProduct` — status=0 软删除 + 重复操作检测

### 步骤 3：实现全局异常处理器

文件：[`backend/src/middleware/errorHandler.js`](backend/src/middleware/errorHandler.js)（约 90 行）

定义了 `BusinessError`、`NotFoundError`、`ValidationError` 三个自定义异常类，以及一个 Express 全局错误处理中间件。

### 步骤 4：配置路由 + 参数校验

文件：[`backend/src/routes/products.js`](backend/src/routes/products.js)
文件：[`backend/src/validators/index.js`](backend/src/validators/index.js)（新增 product CRUD 校验规则）

### 步骤 5：接口测试（10 个用例全覆盖）

#### 正常场景

**TC01 — 新增商品**
```
POST /api/products/add
Body: { "name":"蓝牙音箱", "price":299.00, "stock":100, "category":"手机数码" }

Response 201:
{
  "code": 201,
  "message": "商品添加成功",
  "data": { "id": 9, "name": "蓝牙音箱", "price": 299.00, ... },
  "timestamp": "2026-06-14T14:11:50.043Z"
}
```
✅ 新增成功，返回完整商品信息，状态码 201

**TC02 — 分页查询列表**
```
GET /api/products/query?page=1&pageSize=3

Response 200:
{
  "code": 200,
  "message": "success",
  "data": [ 3条商品数据 ],
  "pagination": { "page": 1, "pageSize": 3, "total": 9, "totalPages": 3 },
  "timestamp": "..."
}
```
✅ 分页信息完整，9 条商品分 3 页

**TC03 — 查询单个商品**
```
GET /api/products/query/1

Response 200:
{ "code": 200, "data": { "id": 1, "name": "iPhone 15 Pro Max", ... } }
```
✅ 返回完整商品详情

**TC04 — 修改商品（部分更新）**
```
PUT /api/products/update/1
Body: { "price": 8888.00, "stock": 88 }

Response 200:
{ "code": 200, "message": "商品修改成功", "data": { "price": 8888, "stock": 88, ... } }
```
✅ 仅更新传入字段，其他字段不变

**TC05 — 删除商品（下架）**
```
DELETE /api/products/delete/1

Response 200:
{ "code": 200, "message": "商品已下架", "data": null }
```
✅ status 被设为 0

#### 异常场景

**TC06 — 参数校验失败**
```
POST /api/products/add
Body: { "price": 999 }  ← 缺少必填字段 name

Response 422:
{
  "code": 422,
  "message": "参数校验失败",
  "errors": [{ "field": "name", "message": "商品名称不能为空" }]
}
```
✅ 精确指出缺失字段和原因

**TC07 — 查询不存在的商品**
```
GET /api/products/query/99999

Response 404:
{ "code": 404, "message": "商品不存在" }
```

**TC08 — 修改不存在的商品**
```
PUT /api/products/update/99999
Body: { "price": 100 }

Response 404:
{ "code": 404, "message": "商品不存在" }
```

**TC09 — 重复下架**
```
DELETE /api/products/delete/1 (第2次)

Response 400:
{ "code": 400, "message": "商品已下架，无需重复操作" }
```
✅ 业务逻辑校验正常

**TC10 — 访问不存在的接口**
```
GET /api/nonexistent

Response 404:
{ "code": 404, "message": "接口不存在" }
```
✅ 全局 404 拦截生效

### 测试结果汇总

| 编号 | 场景 | 接口 | 预期 | 实际 |
|------|------|------|------|------|
| TC01 | 正常 | POST /add | 201 + data | ✅ |
| TC02 | 正常 | GET /query | 200 + pagination | ✅ |
| TC03 | 正常 | GET /query/:id | 200 + data | ✅ |
| TC04 | 正常 | PUT /update/:id | 200 + updated | ✅ |
| TC05 | 正常 | DELETE /delete/:id | 200 + 已下架 | ✅ |
| TC06 | 异常-参数 | POST /add | 422 validError | ✅ |
| TC07 | 异常-不存在 | GET /query/:id | 404 | ✅ |
| TC08 | 异常-不存在 | PUT /update/:id | 404 | ✅ |
| TC09 | 异常-业务 | DELETE /delete/:id | 400 businessError | ✅ |
| TC10 | 异常-路由 | GET /nonexistent | 404 | ✅ |

> **测试通过率: 10/10 = 100%**

---

## [实验总结]

### 实验收获

1. **统一返回格式的价值**：通过 `Result` 类实现了全系统响应格式的一致化，前端只需编写一套解析逻辑
2. **RESTful 设计实践**：掌握了资源导向的 URL 设计（`/products` + 动作）、HTTP 方法语义（GET/POST/PUT/DELETE）、状态码的正确使用
3. **全局异常处理模式**：理解了 Express 中间件链中错误处理的位置（四个参数签名），以及如何通过自定义异常类实现不同类型的错误响应
4. **软删除 vs 硬删除**：学会了在业务系统中使用状态标记代替物理删除，保留数据完整性
5. **参数校验分层**：express-validator 作为 Controller 前的"守门员"，有效防止非法数据进入业务层

### 遇到的问题与解决

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 响应格式不统一 | 早期各接口手写 JSON | 开发 `Result` 类全局统一 |
| UPDATE SQL 拼接复杂 | 需要支持部分字段更新 | 动态构建 SET 子句，只更新传入字段 |
| 重复操作无提示 | 未校验当前状态 | DELETE 前检查 status，已下架则返回 400 |

### 注意事项

1. `Result` 类的方法应返回纯对象而非 JSON 字符串，由 Express 的 `res.json()` 负责序列化
2. 全局异常处理器必须放在所有路由注册之后（Express 中间件执行顺序）
3. express-validator 的 `validate` 中间件须紧跟在校验规则数组之后
4. 动态 SQL 拼接时需注意参数顺序与 `?` 占位符的一一对应
5. 生产环境应隐藏堆栈信息（本系统通过 `config.nodeEnv` 控制）
