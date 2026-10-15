import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '../config/api.config';
import { Movement, Product } from './database.service';

export interface DashboardData {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  healthyPercentage: number;
  recentMovements: Movement[];
  updatedAt: string;
}

export interface UserProfile {
  id?: number | string;
  name?: string;
  username?: string | null;
  email?: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface DashboardResponse extends ApiEnvelope<DashboardData> {}
interface ProductsResponse extends ApiEnvelope<Product[]> {}
interface ProfileResponse extends ApiEnvelope<UserProfile> {}

export interface MovementPayload {
  product_id: number;
  type: 'Entrada' | 'Salida';
  quantity: number;
  notes: string | null;
}

export interface ProductPayload {
  name: string;
  code: string;
  price: number;
  available: number;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryApiService {
  private readonly requestConfig: AxiosRequestConfig = { timeout: 10000 };

  async getProducts(): Promise<Product[]> {
    const response = await axios.get<ProductsResponse>(API_ENDPOINTS.productos, this.requestConfig);
    return this.requireData(response.data, 'No se pudieron cargar los productos.');
  }

  async createProduct(payload: ProductPayload): Promise<Product> {
    const response = await axios.post<Product>(API_ENDPOINTS.productos, payload, this.requestConfig);
    return this.normalizeProduct(response.data);
  }

  async updateProduct(id: number, payload: ProductPayload): Promise<Product> {
    const response = await axios.put<Product>(`${API_ENDPOINTS.productos}/${id}`, payload, this.requestConfig);
    return this.normalizeProduct(response.data);
  }

  async patchProduct(id: number, changes: Partial<ProductPayload>): Promise<Product> {
    const response = await axios.patch<Product>(`${API_ENDPOINTS.productos}/${id}`, changes, this.requestConfig);
    return this.normalizeProduct(response.data);
  }

  async deleteProduct(id: number): Promise<void> {
    await axios.delete(`${API_ENDPOINTS.productos}/${id}`, this.requestConfig);
  }

  async getDashboard(): Promise<DashboardData> {
    const response = await axios.get<DashboardResponse>(API_ENDPOINTS.dashboard, this.requestConfig);
    return this.requireData(response.data, 'No se pudo cargar el dashboard.');
  }

  async createMovement(payload: MovementPayload): Promise<void> {
    await axios.post(API_ENDPOINTS.movimientos, payload, this.requestConfig);
  }

  async getProfile(userId: number | string): Promise<UserProfile> {
    const response = await axios.get<ProfileResponse>(API_ENDPOINTS.perfil, {
      ...this.requestConfig,
      params: { user_id: userId },
    });
    return this.requireData(response.data, 'No se pudo cargar el perfil.');
  }

  async updateProfile(payload: UserProfile & { id: number | string }): Promise<UserProfile> {
    const response = await axios.patch<ProfileResponse>(API_ENDPOINTS.perfil, payload, this.requestConfig);
    return this.requireData(response.data, 'No se pudo guardar el perfil.');
  }

  getErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
      return error.response?.data?.error || error.response?.data?.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
  }

  isConnectionError(error: unknown): boolean {
    return axios.isAxiosError(error) && !error.response;
  }

  private requireData<T>(response: ApiEnvelope<T>, fallback: string): T {
    if (!response.success || response.data === undefined) {
      throw new Error(response.message || response.error || fallback);
    }
    return response.data;
  }

  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      available: Number(product.available),
    };
  }
}
