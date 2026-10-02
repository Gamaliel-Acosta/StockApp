export const API_HOST_STORAGE_KEY = 'apiHost';
export const DEFAULT_API_HOST = '192.168.1.6:8080';

export function getApiHost(): string {
  return localStorage.getItem(API_HOST_STORAGE_KEY) || DEFAULT_API_HOST;
}

export function normalizeApiHost(value: string): string {
  const host = value.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const url = new URL(`http://${host}`);

  if (!url.hostname || !url.port) {
    throw new Error('Ingresa la IP y el puerto del API, por ejemplo 192.168.1.138:8080.');
  }

  return `${url.hostname}${url.port ? `:${url.port}` : ''}`;
}

export function saveApiHost(value: string): string {
  const host = normalizeApiHost(value);
  localStorage.setItem(API_HOST_STORAGE_KEY, host);
  return host;
}

export function getLoginEndpoint(host: string = getApiHost()): string {
  return `http://${host}/login.php`;
}

export const API_ENDPOINTS = {
  get login() {
    return getLoginEndpoint();
  },
  get dashboard() {
    return `http://${getApiHost()}/api/dashboard`;
  },
  get productos() {
    return `http://${getApiHost()}/api/productos`;
  },
  get movimientos() {
    return `http://${getApiHost()}/api/movimientos`;
  },
} as const;
