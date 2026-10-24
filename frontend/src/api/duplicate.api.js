
import { apiRequest } from './client';

export const duplicateApi = {
  getAll() {
    return apiRequest('/duplicates');
  },

  getById(id) {
    return apiRequest(`/duplicates/${id}`);
  },

  // Tự động quét để phát hiện hồ sơ nghi trùng
  scan() {
    return apiRequest('/duplicates/scan', {
      method: 'POST'
    });
  }
};
