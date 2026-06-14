import client from './client';

export function createOrder(data) {
  return client.post('/orders', data);
}

export function listOrders(params = {}) {
  return client.get('/orders', { params });
}

export function getOrder(id) {
  return client.get(`/orders/${id}`);
}
