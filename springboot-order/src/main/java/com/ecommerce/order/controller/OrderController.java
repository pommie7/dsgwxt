package com.ecommerce.order.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.ecommerce.order.common.PageResult;
import com.ecommerce.order.common.Result;
import com.ecommerce.order.dto.OrderCreateDTO;
import com.ecommerce.order.dto.OrderQueryDTO;
import com.ecommerce.order.dto.OrderStatusDTO;
import com.ecommerce.order.dto.OrderVO;
import com.ecommerce.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 订单管理 CRUD 接口
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建订单
     * POST /api/orders
     */
    @PostMapping
    public Result<OrderVO> createOrder(@Valid @RequestBody OrderCreateDTO dto) {
        OrderVO vo = orderService.createOrder(dto);
        return Result.ok("订单创建成功", vo);
    }

    /**
     * 查询订单列表 (分页 + 多条件筛选)
     * GET /api/orders?page=1&pageSize=10&userId=1001&status=pending&orderNo=2024
     */
    @GetMapping
    public Result<PageResult<OrderVO>> listOrders(@Valid OrderQueryDTO dto) {
        IPage<OrderVO> page = orderService.listOrders(dto);
        PageResult<OrderVO> result = PageResult.of(
                page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()
        );
        return Result.ok(result);
    }

    /**
     * 查询订单详情
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public Result<OrderVO> getOrder(@PathVariable Long id) {
        OrderVO vo = orderService.getOrder(id);
        return Result.ok(vo);
    }

    /**
     * 更新订单状态
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public Result<OrderVO> updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody OrderStatusDTO dto) {
        OrderVO vo = orderService.updateStatus(id, dto.getStatus());
        return Result.ok("订单状态更新成功", vo);
    }

    /**
     * 删除订单 (逻辑删除)
     * DELETE /api/orders/{id}
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return Result.ok("订单删除成功", null);
    }
}
