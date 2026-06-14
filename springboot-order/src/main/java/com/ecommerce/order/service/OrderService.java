package com.ecommerce.order.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.ecommerce.order.dto.OrderCreateDTO;
import com.ecommerce.order.dto.OrderQueryDTO;
import com.ecommerce.order.dto.OrderVO;

/**
 * 订单服务接口
 */
public interface OrderService {

    /**
     * 创建订单
     * @param dto 订单创建请求
     * @return 订单详情 VO
     */
    OrderVO createOrder(OrderCreateDTO dto);

    /**
     * 分页查询订单列表
     * @param dto 查询条件
     * @return 分页结果
     */
    IPage<OrderVO> listOrders(OrderQueryDTO dto);

    /**
     * 查询订单详情
     * @param id 订单ID
     * @return 订单详情 VO
     */
    OrderVO getOrder(Long id);

    /**
     * 更新订单状态
     * @param id     订单ID
     * @param status 新状态
     * @return 更新后的订单 VO
     */
    OrderVO updateStatus(Long id, String status);

    /**
     * 删除订单 (逻辑删除)
     * @param id 订单ID
     */
    void deleteOrder(Long id);
}
