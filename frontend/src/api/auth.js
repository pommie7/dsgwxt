import client from './client';

export function login(username, password) {
  return client.post('/auth/login', { username, password });
}

export function register(data) {
  return client.post('/auth/register', data);
}

export function getProfile() {
  return client.get('/auth/profile');
}
