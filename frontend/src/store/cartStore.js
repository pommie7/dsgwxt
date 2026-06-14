import { create } from 'zustand';

/**
 * ============================================================
 * 购物车全局状态 Store (Pinia 模式 / Zustand 实现)
 * ============================================================
 *
 * Pinia 核心概念:
 *   state    → 响应式数据
 *   getters  → 计算属性 (computed)
 *   actions  → 修改状态的方法
 *
 * 功能:
 *   addItem()        — 添加商品到购物车
 *   removeItem()     — 从购物车移除商品
 *   updateQuantity() — 修改商品数量
 *   clearCart()      — 清空购物车
 *   totalCount       — 商品总件数 (getter)
 *   totalPrice       — 总金额 (getter)
 *   isEmpty          — 是否为空 (getter)
 *
 * 持久化: localStorage 自动同步
 */

// 从 localStorage 读取初始数据
function loadFromStorage() {
  try {
    const data = localStorage.getItem('cart_items');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 写入 localStorage
function saveToStorage(items) {
  localStorage.setItem('cart_items', JSON.stringify(items));
}

/**
 * useCartStore — 购物车全局状态 Hook
 *
 * 用法:
 *   const { items, totalCount, totalPrice, addItem, removeItem, clearCart } = useCartStore();
 */
export const useCartStore = create((set, get) => ({
  // =========== State ===========
  items: loadFromStorage(),

  // =========== Getters (计算属性) ===========
  get totalCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  get totalPrice() {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  get isEmpty() {
    return get().items.length === 0;
  },

  // =========== Actions ===========

  /**
   * 添加商品到购物车
   * @param {Object} product — 商品对象 (含 id, name, price, promotion?)
   * @param {number} quantity — 数量 (默认1)
   */
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id);

      let newItems;
      if (existing) {
        // 已存在 → 增加数量
        newItems = state.items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: +(item.price * (item.quantity + quantity)).toFixed(2),
              }
            : item
        );
      } else {
        // 新商品 → 添加到列表
        const price = product.promotion
          ? +(product.price * product.promotion.discountRate).toFixed(2)
          : product.price;
        newItems = [
          ...state.items,
          {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price,
            quantity,
            subtotal: +(price * quantity).toFixed(2),
          },
        ];
      }

      saveToStorage(newItems);
      return { items: newItems };
    });
  },

  /**
   * 移除单个商品
   * @param {number} id — 购物车项的 id
   */
  removeItem: (id) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      saveToStorage(newItems);
      return { items: newItems };
    });
  },

  /**
   * 修改商品数量
   * @param {number} id       — 购物车项的 id
   * @param {number} quantity — 新数量 (最小1)
   */
  updateQuantity: (id, quantity) => {
    set((state) => {
      const qty = Math.max(1, quantity);
      const newItems = state.items.map((item) =>
        item.id === id
          ? { ...item, quantity: qty, subtotal: +(item.price * qty).toFixed(2) }
          : item
      );
      saveToStorage(newItems);
      return { items: newItems };
    });
  },

  /**
   * 清空购物车
   */
  clearCart: () => {
    saveToStorage([]);
    set({ items: [] });
  },
}));
