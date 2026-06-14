-- 测试数据: 订单 (deleted=0 表示未删除)
INSERT INTO orders (id, order_no, user_id, total_amount, status, receiver_name, receiver_phone, receiver_address, remark, deleted) VALUES
(1, '20240601A1B2C3D4', 1001, 21897.00, 'pending',    '张三', '13800138001', '北京市朝阳区望京SOHO 1号楼', '请尽快发货', 0),
(2, '20240602E5F6G7H8', 1001, 14999.00, 'paid',       '张三', '13800138001', '北京市朝阳区望京SOHO 1号楼', '', 0),
(3, '20240603I9J0K1L2', 1002,  8298.00, 'shipped',    '李四', '13900139002', '上海市浦东新区陆家嘴环路100号', '工作日配送', 0),
(4, '20240604M3N4O5P6', 1003,  3499.00, 'completed',  '王五', '13700137003', '广州市天河区体育西路200号', '', 0),
(5, '20240605Q7R8S9T0', 1002, 12998.00, 'pending',    '李四', '13900139002', '上海市浦东新区陆家嘴环路100号', '周末不配送', 0);

-- 测试数据: 订单明细
INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
(1,  1, 1, 'iPhone 15 Pro Max',  9999.00, 2, 19998.00),
(2,  1, 3, 'AirPods Pro 2',      1899.00, 1,  1899.00),
(3,  2, 2, 'MacBook Pro 14"',   14999.00, 1, 14999.00),
(4,  3, 5, 'iPad Air M2',        4799.00, 1,  4799.00),
(5,  3, 8, 'Dell U2723QE',       3499.00, 1,  3499.00),
(6,  4, 8, 'Dell U2723QE',       3499.00, 1,  3499.00),
(7,  5, 6, '华为 Mate 60 Pro',    6999.00, 1,  6999.00),
(8,  5, 7, '小米14 Ultra',        5999.00, 1,  5999.00);
