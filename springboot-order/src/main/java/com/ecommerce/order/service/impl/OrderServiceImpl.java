package com.ecommerce.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ecommerce.order.dto.OrderCreateDTO;
import com.ecommerce.order.dto.OrderQueryDTO;
import com.ecommerce.order.dto.OrderVO;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.mapper.OrderItemMapper;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 订单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    /**
     * 生成订单号: YYYYMMDD + 12位随机字符(大写)
     */
    private String generateOrderNo() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return datePart + randomPart;
    }

    @Override
    @Transactional
    public OrderVO createOrder(OrderCreateDTO dto) {
        // 1. 计算总金额
        BigDecimal totalAmount = dto.getItems().stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(dto.getUserId());
        order.setTotalAmount(totalAmount);
        order.setStatus("pending");
        order.setReceiverName(dto.getReceiverName() != null ? dto.getReceiverName() : "");
        order.setReceiverPhone(dto.getReceiverPhone() != null ? dto.getReceiverPhone() : "");
        order.setReceiverAddress(dto.getReceiverAddress() != null ? dto.getReceiverAddress() : "");
        order.setRemark(dto.getRemark() != null ? dto.getRemark() : "");

        orderMapper.insert(order);
        log.info("订单创建成功: orderId={}, orderNo={}", order.getId(), order.getOrderNo());

        // 3. 创建订单明细
        for (OrderCreateDTO.OrderItemDTO itemDTO : dto.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(itemDTO.getProductId());
            item.setProductName(itemDTO.getProductName());
            item.setProductPrice(itemDTO.getProductPrice());
            item.setQuantity(itemDTO.getQuantity());
            item.setSubtotal(itemDTO.getProductPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            orderItemMapper.insert(item);
        }

        log.info("订单明细创建成功: orderId={}, itemCount={}", order.getId(), dto.getItems().size());

        // 4. 返回详情
        return getOrder(order.getId());
    }

    @Override
    public IPage<OrderVO> listOrders(OrderQueryDTO dto) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();

        if (dto.getUserId() != null) {
            wrapper.eq(Order::getUserId, dto.getUserId());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            wrapper.eq(Order::getStatus, dto.getStatus());
        }
        if (dto.getOrderNo() != null && !dto.getOrderNo().isBlank()) {
            wrapper.like(Order::getOrderNo, dto.getOrderNo());
        }
        wrapper.orderByDesc(Order::getCreatedAt);

        Page<Order> page = new Page<>(dto.getPage(), dto.getPageSize());
        IPage<Order> orderPage = orderMapper.selectPage(page, wrapper);

        // 转换为 VO
        return orderPage.convert(this::toVO);
    }

    @Override
    public OrderVO getOrder(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在: id=" + id);
        }
        return toVO(order);
    }

    @Override
    @Transactional
    public OrderVO updateStatus(Long id, String status) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在: id=" + id);
        }

        order.setStatus(status);
        orderMapper.updateById(order);

        log.info("订单状态更新: orderId={}, oldStatus={}, newStatus={}", id, order.getStatus(), status);
        return toVO(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在: id=" + id);
        }

        // 逻辑删除订单 (MyBatis Plus 自动设置 deleted=1)
        orderMapper.deleteById(id);
        // 同时逻辑删除关联的订单明细
        LambdaQueryWrapper<OrderItem> itemWrapper = new LambdaQueryWrapper<>();
        itemWrapper.eq(OrderItem::getOrderId, id);
        orderItemMapper.delete(itemWrapper);

        log.info("订单已删除: orderId={}", id);
    }

    // ---- 内部辅助方法 ----

    /**
     * 将 Order 实体转为 OrderVO，并填充订单明细
     */
    private OrderVO toVO(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setUserId(order.getUserId());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setStatus(order.getStatus());
        vo.setReceiverName(order.getReceiverName());
        vo.setReceiverPhone(order.getReceiverPhone());
        vo.setReceiverAddress(order.getReceiverAddress());
        vo.setRemark(order.getRemark());
        vo.setCreatedAt(order.getCreatedAt());
        vo.setUpdatedAt(order.getUpdatedAt());

        // 查询订单明细
        LambdaQueryWrapper<OrderItem> itemWrapper = new LambdaQueryWrapper<>();
        itemWrapper.eq(OrderItem::getOrderId, order.getId());
        List<OrderItem> items = orderItemMapper.selectList(itemWrapper);

        List<OrderVO.OrderItemVO> itemVOs = items.stream().map(item -> {
            OrderVO.OrderItemVO itemVO = new OrderVO.OrderItemVO();
            itemVO.setId(item.getId());
            itemVO.setProductId(item.getProductId());
            itemVO.setProductName(item.getProductName());
            itemVO.setProductPrice(item.getProductPrice());
            itemVO.setQuantity(item.getQuantity());
            itemVO.setSubtotal(item.getSubtotal());
            return itemVO;
        }).collect(Collectors.toList());

        vo.setItems(itemVOs);
        return vo;
    }
}
