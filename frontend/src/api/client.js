
const BASE_URL = '/api';

// Token đăng nhập chỉ lưu trong bộ nhớ
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Không thể kết nối đến máy chủ.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Vui lòng đăng nhập hoặc đăng nhập lại.');
    }

    if (response.status === 403) {
      throw new Error('Bạn không có quyền thực hiện thao tác này.');
    }

    if (response.status === 404) {
      throw new Error('Không tìm thấy dữ liệu.');
    }

    throw new Error(`Yêu cầu thất bại (HTTP ${response.status}).`);
  }

  if (response.status === 204) return null;

  return response.json();
}
