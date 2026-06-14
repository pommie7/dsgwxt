package com.ecommerce.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单详情响应 VO
 */
@Data
public class OrderVO {

    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalAmount;
    private String status;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 订单商品明细 */
    private List<OrderItemVO> items;

    @Data
    public static class OrderItemVO {
        private Long id;
        private Long productId;
        private String productName;
        private BigDecimal productPrice;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}
