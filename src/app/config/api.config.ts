export const API_BASE_URL = 'http://myfirstapp.test:8080';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login.php`,
  dashboard: `${API_BASE_URL}/api/dashboard`,
  productos: `${API_BASE_URL}/api/productos`,
  movimientos: `${API_BASE_URL}/api/movimientos`,
} as const;
