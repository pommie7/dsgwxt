package com.ecommerce.order;

import com.ecommerce.order.common.Result;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.dto.OrderCreateDTO.OrderItemDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 订单模块 CRUD 接口集成测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OrderApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdOrderId;

    // ==================== 1. 创建订单测试 ====================

    @Test
    @org.junit.jupiter.api.Order(1)
    @DisplayName("TC01 — 创建订单 (正常)")
    void testCreateOrder() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setUserId(1001L);
        dto.setReceiverName("赵六");
        dto.setReceiverPhone("13600136006");
        dto.setReceiverAddress("深圳市南山区科技园");
        dto.setRemark("测试订单");

        OrderItemDTO item1 = new OrderItemDTO();
        item1.setProductId(1L);
        item1.setProductName("iPhone 15 Pro Max");
        item1.setProductPrice(new BigDecimal("9999.00"));
        item1.setQuantity(1);

        OrderItemDTO item2 = new OrderItemDTO();
        item2.setProductId(3L);
        item2.setProductName("AirPods Pro 2");
        item2.setProductPrice(new BigDecimal("1899.00"));
        item2.setQuantity(2);

        dto.setItems(List.of(item1, item2));

        MvcResult result = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.orderNo").isString())
                .andExpect(jsonPath("$.data.totalAmount").value(13797.00))
                .andExpect(jsonPath("$.data.status").value("pending"))
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andReturn();

        // 提取订单ID供后续测试使用
        String json = result.getResponse().getContentAsString();
        createdOrderId = objectMapper.readTree(json).get("data").get("id").asLong();
        System.out.println("✅ TC01 通过 — 创建订单成功: orderId=" + createdOrderId);
    }

    // ==================== 2. 创建订单 (参数校验) ====================

    @Test
    @org.junit.jupiter.api.Order(2)
    @DisplayName("TC02 — 创建订单 (参数校验失败: 空商品列表)")
    void testCreateOrderValidation() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setUserId(1001L);
        dto.setItems(List.of()); // 空列表

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(422))
                .andExpect(jsonPath("$.message").value("订单商品不能为空"));

        System.out.println("✅ TC02 通过 — 参数校验正常拦截");
    }

    // ==================== 3. 查询订单列表 ====================

    @Test
    @org.junit.jupiter.api.Order(3)
    @DisplayName("TC03 — 查询全部订单列表 (分页)")
    void testListOrdersAll() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("page", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list.length()").value(6)) // 5 seed + 1 new
                .andExpect(jsonPath("$.data.total").value(6))
                .andExpect(jsonPath("$.data.totalPages").value(1));

        System.out.println("✅ TC03 通过 — 查询全部订单 (6条)");
    }

    // ==================== 4. 按用户ID筛选 ====================

    @Test
    @org.junit.jupiter.api.Order(4)
    @DisplayName("TC04 — 按用户ID筛选订单")
    void testListOrdersByUserId() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("page", "1")
                        .param("pageSize", "10")
                        .param("userId", "1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(3)) // seeds: 2 for 1001 + created
                .andExpect(jsonPath("$.data.list[0].userId").value(1001));

        System.out.println("✅ TC04 通过 — 按用户ID筛选 (3条, user=1001)");
    }

    // ==================== 5. 按状态筛选 ====================

    @Test
    @org.junit.jupiter.api.Order(5)
    @DisplayName("TC05 — 按订单状态筛选")
    void testListOrdersByStatus() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .param("page", "1")
                        .param("pageSize", "10")
                        .param("status", "pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list[0].status").value("pending"));

        System.out.println("✅ TC05 通过 — 按状态 pending 筛选");
    }

    // ==================== 6. 查询订单详情 ====================

    @Test
    @org.junit.jupiter.api.Order(6)
    @DisplayName("TC06 — 查询订单详情")
    void testGetOrder() throws Exception {
        mockMvc.perform(get("/api/orders/" + createdOrderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(createdOrderId))
                .andExpect(jsonPath("$.data.userId").value(1001))
                .andExpect(jsonPath("$.data.items.length()").value(2));

        System.out.println("✅ TC06 通过 — 查询订单详情 (含2个明细)");
    }

    // ==================== 7. 查询不存在的订单 ====================

    @Test
    @org.junit.jupiter.api.Order(7)
    @DisplayName("TC07 — 查询不存在的订单")
    void testGetOrderNotFound() throws Exception {
        mockMvc.perform(get("/api/orders/99999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("订单不存在: id=99999"));

        System.out.println("✅ TC07 通过 — 不存在的订单返回400");
    }

    // ==================== 8. 更新订单状态 ====================

    @Test
    @org.junit.jupiter.api.Order(8)
    @DisplayName("TC08 — 更新订单状态 (pending → paid)")
    void testUpdateStatus() throws Exception {
        OrderStatusDTO dto = new OrderStatusDTO();
        dto.setStatus("paid");

        mockMvc.perform(put("/api/orders/" + createdOrderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("paid"));

        System.out.println("✅ TC08 通过 — 状态更新 success");
    }

    // ==================== 9. 更新订单状态 (非法值) ====================

    @Test
    @org.junit.jupiter.api.Order(9)
    @DisplayName("TC09 — 更新订单状态 (非法状态值)")
    void testUpdateStatusInvalid() throws Exception {
        OrderStatusDTO dto = new OrderStatusDTO();
        dto.setStatus("invalid_status");

        mockMvc.perform(put("/api/orders/" + createdOrderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(422));

        System.out.println("✅ TC09 通过 — 非法状态值被拦截");
    }

    // ==================== 10. 删除订单 (逻辑删除) ====================

    @Test
    @org.junit.jupiter.api.Order(10)
    @DisplayName("TC10 — 逻辑删除订单")
    void testDeleteOrder() throws Exception {
        mockMvc.perform(delete("/api/orders/" + createdOrderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("订单删除成功"));

        // 验证已删除的订单查不到
        mockMvc.perform(get("/api/orders/" + createdOrderId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("订单不存在: id=" + createdOrderId));

        System.out.println("✅ TC10 通过 — 逻辑删除成功, 已无法查询");
    }
}
