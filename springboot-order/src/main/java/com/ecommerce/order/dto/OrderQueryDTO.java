package com.ecommerce.order.dto;

import lombok.Data;

/**
 * 订单查询请求 DTO
 */
@Data
public class OrderQueryDTO {

    /** 页码 (从1开始) */
    private Integer page = 1;

    /** 每页条数 */
    private Integer pageSize = 10;

    /** 用户ID筛选 */
    private Long userId;

    /** 订单状态筛选 */
    private String status;

    /** 订单号模糊搜索 */
    private String orderNo;
}
