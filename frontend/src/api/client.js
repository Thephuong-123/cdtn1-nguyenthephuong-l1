
const BASE_URL = '/api';

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Không thể kết nối đến máy chủ.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Không tìm thấy dữ liệu.');
    }

    throw new Error(`Yêu cầu thất bại (HTTP ${response.status}).`);
  }

  if (response.status === 204) return null;

  return response.json();
}
