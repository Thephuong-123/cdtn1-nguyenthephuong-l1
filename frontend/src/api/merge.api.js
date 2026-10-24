
import { apiRequest } from './client';

// API gộp hồ sơ khách hàng - US7
export const mergeApi = {
  merge(data) {
    return apiRequest('/merges', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
