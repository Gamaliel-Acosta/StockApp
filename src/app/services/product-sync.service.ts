import { Injectable } from '@angular/core';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';
import { ConnectivityService } from './connectivity.service';
import { DatabaseService, Product } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class ProductSyncService {
  private started = false;
  private syncing = false;

  constructor(
    private readonly database: DatabaseService,
    private readonly connectivity: ConnectivityService,
  ) {}

  start(): void {
    if (this.started) return;

    this.started = true;
    this.connectivity.offlineMode$.subscribe((isOffline) => {
      if (!isOffline) void this.syncPendingProducts();
    });
    void this.syncPendingProducts();
  }

  async syncPendingProducts(): Promise<void> {
    if (this.syncing || this.connectivity.isOffline) return;

    this.syncing = true;
    try {
      await this.database.init();
      if (!this.database.isAvailable) return;

      const pendingProducts = await this.database.getPendingProducts();
      for (const pendingProduct of pendingProducts) {
        try {
          const response = await axios.post<Product>(API_ENDPOINTS.productos, {
            name: pendingProduct.name,
            code: pendingProduct.code,
            price: pendingProduct.price,
            available: pendingProduct.available,
          }, { timeout: 10000 });

          const product = this.normalizeProduct(response.data);
          await this.database.replacePendingProduct(pendingProduct.id, product);
        } catch (error: unknown) {
          if (this.connectivity.isConnectionError(error)) {
            this.connectivity.markOffline();
          }
          return;
        }
      }
    } finally {
      this.syncing = false;
    }
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