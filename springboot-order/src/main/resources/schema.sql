-- =============================================
-- 电商订单模块 — 表结构 DDL
-- 数据库: H2 (兼容 MySQL 语法)
-- =============================================

-- 订单主表
CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no        VARCHAR(32)  NOT NULL COMMENT '订单号',
    user_id         BIGINT       NOT NULL COMMENT '用户ID',
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT '订单状态: pending/paid/shipped/completed/cancelled',
    receiver_name   VARCHAR(50)  DEFAULT '' COMMENT '收货人',
    receiver_phone  VARCHAR(20)  DEFAULT '' COMMENT '收货电话',
    receiver_address VARCHAR(200) DEFAULT '' COMMENT '收货地址',
    remark          VARCHAR(500) DEFAULT '' COMMENT '备注',
    deleted         TINYINT      DEFAULT 0 COMMENT '逻辑删除: 0-正常, 1-已删除',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 订单商品明细表
CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id        BIGINT       NOT NULL COMMENT '订单ID',
    product_id      BIGINT       NOT NULL COMMENT '商品ID',
    product_name    VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_price   DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity        INT          NOT NULL COMMENT '购买数量',
    subtotal        DECIMAL(10,2) NOT NULL COMMENT '小计金额',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_no   ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
