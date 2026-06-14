package com.ecommerce.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

/**
 * 创建订单请求 DTO
 */
@Data
public class OrderCreateDTO {

    /** 用户ID */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /** 订单商品列表 */
    @Valid
    @NotEmpty(message = "订单商品不能为空")
    private List<OrderItemDTO> items;

    /** 收货人 */
    private String receiverName;

    /** 收货电话 */
    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String receiverPhone;

    /** 收货地址 */
    private String receiverAddress;

    /** 备注 */
    private String remark;

    /**
     * 订单商品项 DTO
     */
    @Data
    public static class OrderItemDTO {
        @NotNull(message = "商品ID不能为空")
        @Min(value = 1, message = "商品ID必须为正整数")
        private Long productId;

        @NotBlank(message = "商品名称不能为空")
        private String productName;

        @NotNull(message = "商品单价不能为空")
        @DecimalMin(value = "0.01", message = "商品单价必须大于0")
        private java.math.BigDecimal productPrice;

        @NotNull(message = "购买数量不能为空")
        @Min(value = 1, message = "购买数量至少为1")
        @Max(value = 9999, message = "购买数量不能超过9999")
        private Integer quantity;
    }
}
