
import { apiRequest } from './client';

// API đăng nhập
export const authApi = {
  login(username, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      })
    });
  }
};
