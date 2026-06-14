# 🛒 电商购物平台

一个完整的全栈电商购物平台，包含用户认证（JWT Token）、商品浏览、订单管理等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + React Router v6 + Axios |
| 后端 | Node.js + Express |
| 数据库 | SQLite (sql.js) |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 校验 | express-validator |

## 项目结构

```
ecommerce-platform/
├── backend/                    # Express API 服务
│   └── src/
│       ├── config/             # 数据库连接、环境配置
│       │   ├── index.js        # 配置中心（读取 .env）
│       │   └── database.js     # SQLite 初始化、表创建、数据种子
│       ├── controllers/        # 业务逻辑层
│       │   ├── authController.js    # 注册 / 登录 / 个人信息
│       │   ├── productController.js # 商品列表 / 详情
│       │   └── orderController.js   # 订单创建 / 列表 / 详情
│       ├── middleware/         # Express 中间件
│       │   ├── auth.js         # JWT 认证中间件
│       │   └── errorHandler.js # 全局错误处理
│       ├── routes/             # 路由定义
│       ├── validators/         # 请求参数校验
│       ├── utils/              # 工具函数（JWT、订单号生成）
│       └── app.js              # 应用入口
├── frontend/                   # React SPA
│   └── src/
│       ├── api/                # API 请求封装 + Axios 拦截器
│       ├── components/         # 通用组件（Layout、Pagination）
│       ├── pages/              # 页面组件
│       │   ├── LoginPage.jsx       # 登录
│       │   ├── RegisterPage.jsx    # 注册
│       │   ├── ProductsPage.jsx    # 商品列表（搜索/分类/分页）
│       │   ├── OrdersPage.jsx      # 订单列表（状态筛选/分页）
│       │   └── OrderDetailPage.jsx # 订单详情
│       ├── store/              # 全局状态（AuthContext）
│       └── utils/              # 工具函数
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 1. 安装后端依赖并启动
cd backend
cp .env.example .env      # 复制环境配置（可按需修改 JWT_SECRET）
npm install
npm run dev                # 开发模式（nodemon 热重载）
# 后端运行在 http://localhost:3001

# 2. 安装前端依赖并启动（新终端）
cd frontend
npm install
npm run dev                # Vite 开发服务器
# 前端运行在 http://localhost:5173
```

> **说明**：Vite 配置了代理，前端 `/api/*` 请求会自动转发到 `http://localhost:3001`。

### 快速测试 API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 用户注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456","email":"demo@test.com"}'

# 用户登录（获取 Token）
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456"}'

# 查询商品（带 Token）
curl http://localhost:3001/api/products?page=1&pageSize=5

# 查询订单（需要替换 YOUR_TOKEN）
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API 接口文档

### 认证模块 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 用户注册 |
| POST | `/api/auth/login` | 否 | 用户登录（返回 JWT Token） |
| GET | `/api/auth/profile` | 是 | 获取当前用户信息 |

### 商品模块 `/api/products`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/products` | 否 | 商品列表（支持 ?category=&keyword=&page=&pageSize=） |
| GET | `/api/products/:id` | 否 | 商品详情 |

### 订单模块 `/api/orders`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/orders` | 是 | 创建订单 |
| GET | `/api/orders` | 是 | 订单列表（支持 ?status=&page=&pageSize=） |
| GET | `/api/orders/:id` | 是 | 订单详情 |

## 登录验证原理说明

本系统采用 **JWT（JSON Web Token）** 实现无状态认证：

```
┌──────────────┐                      ┌──────────────┐
│   前端 (SPA)  │                      │  后端 (API)   │
└──────┬───────┘                      └──────┬───────┘
       │                                     │
       │  1. POST /api/auth/login            │
       │     { username, password }          │
       │────────────────────────────────────>│
       │                                     │ 2. 查询数据库验证用户
       │                                     │ 3. bcrypt.compare 验证密码
       │                                     │ 4. 生成 JWT Token
       │  5. 返回 { token, user }             │    - Header:  { alg: "HS256" }
       │<────────────────────────────────────│    - Payload: { id, username, iat, exp }
       │                                     │    - Signature: HMAC-SHA256(payload, secret)
       │                                     │
       │  6. 存储 Token 到 localStorage       │
       │                                     │
       │  7. GET /api/orders                 │
       │     Authorization: Bearer <token>   │
       │────────────────────────────────────>│ 8. authMiddleware 拦截请求
       │                                     │    - 提取 Authorization header
       │                                     │    - 验证 Bearer 格式
       │                                     │    - jwt.verify(token, secret)
       │                                     │    - 解码得到 { id, username }
       │                                     │    - req.user = decoded
       │                                     │ 9. 执行业务逻辑
       │  10. 返回订单数据                     │
       │<────────────────────────────────────│
```

### Token 生命周期

1. **生成**：用户登录/注册成功后，后端用 `jsonwebtoken` 签发 Token，包含用户 ID 和用户名，默认有效期 24 小时
2. **传输**：前端 Axios 拦截器在每次请求时自动从 `localStorage` 读取 Token，附加到 `Authorization: Bearer <token>` 请求头
3. **验证**：后端 `authMiddleware` 从请求头提取 Token → 调用 `jwt.verify()` 校验签名和有效期 → 通过后将解码后的用户信息注入 `req.user`
4. **过期处理**：前端 Axios 响应拦截器捕获 401 状态码 → 清除本地 Token → 重定向到登录页

### 安全措施

- 密码使用 **bcryptjs** 加盐哈希存储（`saltRounds=10`），不可逆
- JWT 使用 **HMAC-SHA256** 签名，防止篡改
- Token 默认 24 小时过期，防止长期泄露风险
- 请求参数使用 `express-validator` 校验，防止恶意输入
- CORS 配置，限制跨域请求来源

## 订单查询功能前后端工作过程

```
┌──────────────────── 前端流程 ────────────────────┐
│                                                    │
│  OrdersPage.jsx 组件挂载                            │
│       │                                            │
│       ├─ 检查登录状态 (isAuthenticated)              │
│       │   └─ 未登录 → navigate('/login')            │
│       │                                            │
│       ├─ 调用 listOrders({ page, pageSize, status })│
│       │   └─ orders.js: get('/orders', { params })  │
│       │       └─ client.js: 请求拦截器附加 Token     │
│       │           └─ axios.get(...) ────────────────┼──>
│       │                                            │
│       ├─ 收到响应 → setOrders(res.data.list)        │
│       │            → setPagination(res.data.pagination)
│       │                                            │
│       ├─ 渲染订单列表（订单号、状态、商品、金额）       │
│       │                                            │
│       └─ 状态筛选 onChange → fetchOrders(1)         │
│          └─ 重新调用 API，按 status 过滤             │
│                                                    │
└────────────────────────────────────────────────────┘

┌──────────────────── 后端流程 ────────────────────┐
│                                              ←────┤
│  1. authMiddleware 验证 Token                      │
│     └─ 从 Authorization header 提取 Bearer token   │
│     └─ jwt.verify(token, secret)                   │
│     └─ 解码得到 { id: 1, username: "demo" }        │
│     └─ req.user = decoded, next()                  │
│                                                    │
│  2. orderListRules 校验查询参数                     │
│     └─ page: int(≥1), pageSize: int(1-100)         │
│     └─ status: 可选枚举值                           │
│                                                    │
│  3. orderController.listOrders                     │
│     ├─ 构建 SQL WHERE 条件（user_id + 可选status）  │
│     ├─ SELECT COUNT(*) 查询总数                     │
│     ├─ SELECT * FROM orders 分页查询                │
│     │   └─ WHERE user_id = ? [AND status = ?]      │
│     │   └─ ORDER BY created_at DESC                │
│     │   └─ LIMIT ? OFFSET ?                        │
│     ├─ 遍历订单，关联查询 order_items                │
│     │   └─ SELECT * FROM order_items WHERE order_id = ?
│     └─ 返回 { list: [...], pagination: {...} }      │
│                                                    │
│  4. 响应 → JSON 格式返回给前端                       │
└────────────────────────────────────────────────────┘
```

### 关键设计

1. **数据隔离**：SQL WHERE 条件强制 `user_id = req.user.id`，用户只能查询自己的订单
2. **分页查询**：前端控制页码和每页条数，后端返回 `{ page, pageSize, total, totalPages }`
3. **状态筛选**：支持 `pending | paid | shipped | completed | cancelled` 五种状态过滤
4. **N+1 查询优化**：先用一条 SQL 查出订单列表，再为每个订单查出对应的商品明细（`order_items`）
5. **错误处理**：Token 过期返回 401 → 前端拦截器清除状态并重定向登录页

## 工程化实践

### 后端

- **分层架构**：Config → Middleware → Validator → Controller → Route，职责清晰
- **统一错误处理**：全局 `errorHandler` 中间件捕获异常，开发环境返回堆栈信息
- **参数校验**：`express-validator` 链式校验，422 返回详细错误字段
- **事务支持**：创建订单使用 `BEGIN/COMMIT/ROLLBACK` 保证数据一致性
- **数据库索引**：为 `user_id`、`order_no` 等高频查询字段建立索引

### 前端

- **组件化**：Layout、Pagination 等通用组件复用
- **状态管理**：React Context 管理认证状态，`useAuth()` Hook 简化调用
- **API 封装**：Axios 拦截器统一处理 Token 附加和 401 响应
- **Vite 代理**：开发环境自动代理 `/api` 到后端，避免跨域问题
- **响应式 UI**：纯 CSS 实现卡片布局、状态标签、分页器等组件

## License

MIT
