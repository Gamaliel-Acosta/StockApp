import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  available: number;
}

export interface Movement {
  product: string;
  type: 'Entrada' | 'Salida';
  date: string;
  icon: string;
}

export interface DashboardSnapshot {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  healthyPercentage: number;
  recentMovements: Movement[];
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private database?: SQLiteDBConnection;
  private initialized = false;

  get isAvailable(): boolean {
    return this.initialized && !!this.database;
  }

  async init(): Promise<boolean> {
    if (this.isAvailable) return true;

    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      this.database = await this.sqlite.createConnection(
        'inventory',
        false,
        'no-encryption',
        1,
        false,
      );

      await this.database.open();
      await this.database.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          price REAL NOT NULL,
          available INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS dashboard_cache (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          total_products INTEGER NOT NULL,
          low_stock INTEGER NOT NULL,
          out_of_stock INTEGER NOT NULL,
          healthy_percentage INTEGER NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product TEXT NOT NULL,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          icon TEXT NOT NULL
        );
      `);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('No se pudo inicializar SQLite:', error);
      this.database = undefined;
      return false;
    }
  }

  async getProducts(): Promise<Product[]> {
    if (!this.database) return [];

    const result = await this.database.query(`
      SELECT id, name, code, price, available
      FROM products
      ORDER BY name;
    `);

    return (result.values ?? []) as Product[];
  }

  async saveProducts(products: Product[]): Promise<void> {
    if (!this.database) return;

    await this.database.execute('BEGIN TRANSACTION;');

    try {
      await this.database.execute('DELETE FROM products;');

      for (const product of products) {
        await this.database.run(
          `
            INSERT INTO products (id, name, code, price, available)
            VALUES (?, ?, ?, ?, ?);
          `,
          [
            product.id,
            product.name,
            product.code,
            product.price,
            product.available,
          ],
        );
      }

      await this.database.execute('COMMIT;');
    } catch (error) {
      await this.database.execute('ROLLBACK;');
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    if (!this.database) return;
    await this.database.run('DELETE FROM products WHERE id = ?;', [id]);
  }

  async getDashboard(): Promise<DashboardSnapshot | null> {
    if (!this.database) return null;

    const summary = await this.database.query(`
      SELECT total_products AS totalProducts,
             low_stock AS lowStock,
             out_of_stock AS outOfStock,
             healthy_percentage AS healthyPercentage,
             updated_at AS updatedAt
      FROM dashboard_cache
      WHERE id = 1;
    `);

    const cachedSummary = summary.values?.[0] as Omit<DashboardSnapshot, 'recentMovements'> | undefined;
    if (!cachedSummary) return null;

    const movements = await this.database.query(`
      SELECT product, type, date, icon
      FROM movements
      ORDER BY date DESC;
    `);

    return {
      ...cachedSummary,
      recentMovements: (movements.values ?? []) as Movement[],
    };
  }

  async saveDashboard(snapshot: DashboardSnapshot): Promise<void> {
    if (!this.database) return;

    await this.database.execute('BEGIN TRANSACTION;');

    try {
      await this.database.run(
        `
          INSERT OR REPLACE INTO dashboard_cache
            (id, total_products, low_stock, out_of_stock, healthy_percentage, updated_at)
          VALUES (1, ?, ?, ?, ?, ?);
        `,
        [
          snapshot.totalProducts,
          snapshot.lowStock,
          snapshot.outOfStock,
          snapshot.healthyPercentage,
          snapshot.updatedAt,
        ],
      );

      await this.database.execute('DELETE FROM movements;');
      for (const movement of snapshot.recentMovements) {
        await this.database.run(
          `
            INSERT INTO movements (product, type, date, icon)
            VALUES (?, ?, ?, ?);
          `,
          [movement.product, movement.type, movement.date, movement.icon],
        );
      }

      await this.database.execute('COMMIT;');
    } catch (error) {
      await this.database.execute('ROLLBACK;');
      throw error;
    }
  }
}