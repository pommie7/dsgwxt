import client from './client';

export function listProducts(params = {}) {
  return client.get('/products', { params });
}

export function getProduct(id) {
  return client.get(`/products/${id}`);
}
