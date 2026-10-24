
import { apiRequest } from './client';

export const customerApi = {
  getAll() {
    return apiRequest('/customers');
  },

  getById(id) {
    return apiRequest(`/customers/${id}`);
  },

  findByPhone(phone) {
    return apiRequest(
      `/customers?phone=${encodeURIComponent(phone)}`
    );
  },

  create(data) {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return apiRequest(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deactivate(id) {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
