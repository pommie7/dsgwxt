package com.ecommerce.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ecommerce.order.entity.Order;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单 Mapper — MyBatis Plus BaseMapper 提供基础 CRUD
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}
