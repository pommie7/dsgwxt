package com.ecommerce.order.common;

import lombok.Data;

import java.util.List;

/**
 * 分页响应封装
 */
@Data
public class PageResult<T> {

    private List<T> list;
    private long page;
    private long pageSize;
    private long total;
    private long totalPages;

    public static <T> PageResult<T> of(List<T> list, long page, long pageSize, long total) {
        PageResult<T> r = new PageResult<>();
        r.list = list;
        r.page = page;
        r.pageSize = pageSize;
        r.total = total;
        r.totalPages = (total + pageSize - 1) / pageSize;
        return r;
    }
}
