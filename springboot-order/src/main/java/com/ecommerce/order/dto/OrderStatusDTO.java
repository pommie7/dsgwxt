package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 更新订单状态请求 DTO
 */
@Data
public class OrderStatusDTO {

    @NotBlank(message = "订单状态不能为空")
    @Pattern(
        regexp = "pending|paid|shipped|completed|cancelled",
        message = "订单状态必须为: pending/paid/shipped/completed/cancelled"
    )
    private String status;
}
