package com.ecommerce.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单商品明细实体 — 对应 order_items 表
 */
@Data
@TableName("order_items")
public class OrderItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属订单ID */
    private Long orderId;

    /** 商品ID */
    private Long productId;

    /** 商品名称（快照，防止商品修改后历史订单数据变化） */
    private String productName;

    /** 商品单价（快照） */
    private BigDecimal productPrice;

    /** 购买数量 */
    private Integer quantity;

    /** 小计金额 */
    private BigDecimal subtotal;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
