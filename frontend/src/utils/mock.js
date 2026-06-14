/**
 * ============================================================
 * mock.js — 商品 Mock 数据服务
 * ============================================================
 *
 * 模拟后端分页查询行为:
 *  - 每次调用 getProducts({ page, pageSize, category, keyword })
 *    都是一次独立的"请求"，返回该页的数据切片
 *  - 支持分类筛选和关键词搜索
 *  - 模拟网络延迟 200~500ms
 *  - 统计请求次数
 */

// ---- Mock 商品数据 (25条，覆盖3个分类) ----
const ALL_PRODUCTS = [
  // ---- 手机数码 ----
  { id: 1,  name: 'iPhone 15 Pro Max',   description: 'Apple A17 Pro芯片 256GB 原色钛金属 5G全网通',     price: 9999.00, stock: 120, category: '手机数码', image_url: '' },
  { id: 2,  name: '华为 Mate 60 Pro',    description: '华为麒麟9000S 12GB+512GB 雅丹黑 卫星通话',         price: 6999.00, stock: 35,  category: '手机数码', image_url: '' },
  { id: 3,  name: '小米14 Ultra',        description: '小米徕卡光学Summilux镜头 骁龙8Gen3 16GB+512GB',    price: 5999.00, stock: 55,  category: '手机数码', image_url: '' },
  { id: 4,  name: 'Samsung Galaxy S24+',  description: '三星 AI智能手机 骁龙8Gen3 12GB+256GB 钛灰',        price: 7499.00, stock: 40,  category: '手机数码', image_url: '' },
  { id: 5,  name: 'OPPO Find X7 Ultra',  description: 'OPPO旗舰影像 骁龙8Gen3 16GB+512GB 海阔天空',       price: 5999.00, stock: 60,  category: '手机数码', image_url: '' },
  { id: 6,  name: 'vivo X100 Pro',       description: 'vivo蔡司超级长焦 天玑9300 16GB+512GB 星迹蓝',      price: 4999.00, stock: 70,  category: '手机数码', image_url: '' },
  { id: 7,  name: 'AirPods Pro 2',       description: 'Apple H2芯片 主动降噪 自适应音频 USB-C',            price: 1899.00, stock: 200, category: '手机数码', image_url: '' },
  { id: 8,  name: 'Sony WH-1000XM5',     description: '索尼旗舰无线降噪头戴式耳机 30小时续航 铂金银',       price: 2499.00, stock: 85,  category: '手机数码', image_url: '' },
  { id: 9,  name: 'Apple Watch Ultra 2', description: '苹果手表Ultra 2 GPS+蜂窝 49mm 钛金属 海洋表带',     price: 6499.00, stock: 30,  category: '手机数码', image_url: '' },

  // ---- 电脑办公 ----
  { id: 10, name: 'MacBook Pro 14"',      description: 'Apple M3 Pro芯片 11核CPU 14核GPU 18GB/512GB 深空黑', price: 14999.00, stock: 50,  category: '电脑办公', image_url: '' },
  { id: 11, name: 'MacBook Air 15"',      description: 'Apple M3芯片 8核CPU 10核GPU 16GB/512GB 午夜色',       price: 10499.00, stock: 45,  category: '电脑办公', image_url: '' },
  { id: 12, name: 'iPad Air M2',          description: 'Apple M2芯片 11英寸 Liquid Retina 128GB WiFi版',       price: 4799.00, stock: 60,  category: '电脑办公', image_url: '' },
  { id: 13, name: 'Dell U2723QE',         description: '戴尔27英寸 4K IPS Black技术 USB-C 90W充电 专业显示器', price: 3499.00, stock: 25,  category: '电脑办公', image_url: '' },
  { id: 14, name: 'ThinkPad X1 Carbon',   description: '联想14英寸商务轻薄本 i7-1365U 16GB/512GB LTE 4G',      price: 9999.00, stock: 20,  category: '电脑办公', image_url: '' },
  { id: 15, name: '华为 MateBook X Pro',  description: '华为3.1K OLED触控屏 i7-1360P 16GB/1TB 拂晓粉',        price: 8999.00, stock: 15,  category: '电脑办公', image_url: '' },
  { id: 16, name: 'Logitech MX Master 3S',description: '罗技MX大师3S 无线蓝牙鼠标 8K DPI USB-C 静音',          price: 699.00,  stock: 150, category: '电脑办公', image_url: '' },
  { id: 17, name: 'Keychron K8 Pro',      description: 'Keychron K8Pro 无线机械键盘 热插拔 Gateron G Pro茶轴', price: 499.00,  stock: 100, category: '电脑办公', image_url: '' },

  // ---- 家用电器 ----
  { id: 18, name: '戴森 V15 Detect',      description: 'Dyson V15无绳吸尘器 激光探测 智能灰尘感应 60分钟续航',  price: 4990.00, stock: 40,  category: '家用电器', image_url: '' },
  { id: 19, name: '米家扫拖机器人2',      description: '小米扫拖一体机器人 激光导航 2800Pa吸力 智能电控水箱',     price: 1499.00, stock: 80,  category: '家用电器', image_url: '' },
  { id: 20, name: '美的洗碗机 M10',       description: 'Midea台式洗碗机 4套容量 高温除菌 超快洗 免安装',          price: 1299.00, stock: 55,  category: '家用电器', image_url: '' },
  { id: 21, name: '格力空调 云佳1.5匹',   description: 'Gree冷暖变频空调 1.5匹 新一级能效 自清洁 壁挂式',          price: 2999.00, stock: 30,  category: '家用电器', image_url: '' },
  { id: 22, name: '海尔冰箱 BCD-500',     description: 'Haier 500升对开门冰箱 风冷无霜 双变频 智能WIFI',          price: 3499.00, stock: 20,  category: '家用电器', image_url: '' },
  { id: 23, name: '戴森 Airwrap HS05',    description: 'Dyson美发造型器 多功能卷发棒 康达效应 防飞翘 新年红',     price: 3690.00, stock: 35,  category: '家用电器', image_url: '' },
  { id: 24, name: '小狗无线吸尘器 T12',   description: '小狗T12 Plus Rinse 擦地吸尘器 150AW吸入功率 70分钟续航',  price: 1999.00, stock: 45,  category: '家用电器', image_url: '' },
  { id: 25, name: '追觅洗地机 H20 Ultra',description: 'Dreame H20 Ultra 洗地机 热水洗地 双侧贴边 60℃热风烘干',    price: 2999.00, stock: 65,  category: '家用电器', image_url: '' },
];

// 所有可用分类
const ALL_CATEGORIES = [...new Set(ALL_PRODUCTS.map((p) => p.category))];

// ---- 请求计数器 ----
let mockRequestCount = 0;

/**
 * Mock 分页查询商品列表
 *
 * @param {Object} params
 * @param {number} params.page     - 页码 (从1开始)
 * @param {number} params.pageSize - 每页条数 (默认12)
 * @param {string} params.category - 分类筛选 (空=全部)
 * @param {string} params.keyword  - 关键词搜索
 * @returns {Promise<Object>} { code, data: { list, pagination } }
 */
function getProducts({
  page = 1,
  pageSize = 12,
  category = '',
  keyword = '',
} = {}) {
  return new Promise((resolve) => {
    mockRequestCount++;
    const requestId = mockRequestCount;

    // 模拟网络延迟 200~500ms
    const delay = 200 + Math.floor(Math.random() * 300);

    console.log(
      `[Mock #${requestId}] GET /api/products?page=${page}&pageSize=${pageSize}` +
        (category ? `&category=${category}` : '') +
        (keyword ? `&keyword=${keyword}` : '') +
        ` — 等待 ${delay}ms...`
    );

    setTimeout(() => {
      // 1. 筛选
      let filtered = [...ALL_PRODUCTS];

      if (category) {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (keyword) {
        const kw = keyword.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(kw) ||
            p.description.toLowerCase().includes(kw)
        );
      }

      // 2. 分页切片
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const safePage = Math.max(1, Math.min(page, totalPages || 1));
      const start = (safePage - 1) * pageSize;
      const end = start + pageSize;
      const list = filtered.slice(start, end);

      console.log(
        `[Mock #${requestId}] ✅ 返回 ${list.length} 条 / 共 ${total} 条 ` +
          `(第 ${safePage}/${totalPages || 1} 页)`
      );

      // 3. 返回标准格式
      resolve({
        code: 200,
        data: {
          list,
          pagination: {
            page: safePage,
            pageSize,
            total,
            totalPages: totalPages || 1,
          },
        },
      });
    }, delay);
  });
}

/**
 * 获取所有分类列表
 */
function getCategories() {
  return Promise.resolve(ALL_CATEGORIES);
}

/**
 * 获取 Mock 请求计数
 */
function getMockRequestCount() {
  return mockRequestCount;
}

/**
 * 重置计数
 */
function resetMockRequestCount() {
  mockRequestCount = 0;
}

export { getProducts, getCategories, getMockRequestCount, resetMockRequestCount, ALL_CATEGORIES };
