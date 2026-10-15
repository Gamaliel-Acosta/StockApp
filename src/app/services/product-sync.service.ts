import { Injectable } from '@angular/core';
import { ConnectivityService } from './connectivity.service';
import { DatabaseService, Product } from './database.service';
import { InventoryApiService } from './inventory-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductSyncService {
  private started = false;
  private syncing = false;

  constructor(
    private readonly database: DatabaseService,
    private readonly connectivity: ConnectivityService,
    private readonly api: InventoryApiService,
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
          const product = await this.api.createProduct({
            name: pendingProduct.name,
            code: pendingProduct.code,
            price: pendingProduct.price,
            available: pendingProduct.available,
          });
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

}