package com.ecommerce.order.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单实体 — 对应 orders 表
 */
@Data
@TableName("orders")
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 订单号 */
    private String orderNo;

    /** 用户ID */
    private Long userId;

    /** 订单总金额 */
    private BigDecimal totalAmount;

    /**
     * 订单状态
     * pending   — 待付款
     * paid      — 已付款
     * shipped   — 已发货
     * completed — 已完成
     * cancelled — 已取消
     */
    private String status;

    /** 收货人姓名 */
    private String receiverName;

    /** 收货人电话 */
    private String receiverPhone;

    /** 收货地址 */
    private String receiverAddress;

    /** 备注 */
    private String remark;

    /** 逻辑删除标记 (0-正常, 1-已删除) */
    @TableLogic(value = "0", delval = "1")
    private Integer deleted;

    /** 创建时间 */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /** 更新时间 */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
