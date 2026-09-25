import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import axios from 'axios';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../config/api.config';
import { DatabaseService, Movement, Product } from '../services/database.service';

interface DashboardResponse {
  success: boolean;
  message: string;
  data?: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
    healthyPercentage: number;
    recentMovements: Movement[];
    updatedAt: string;
  };
}

import {
  addOutline,
  alertCircleOutline,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  barChartOutline,
  barcodeOutline,
  chevronDownOutline,
  chevronForwardOutline,
  cubeOutline,
  flashOutline,
  homeOutline,
  listOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  swapHorizontalOutline,
  warningOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [IonContent, IonIcon, CommonModule, FormsModule],
})
export class DashboardPage implements OnInit {
  searchTerm = '';
  movements: Movement[] = [];
  totalProducts = 0;
  lowStock = 0;
  outOfStock = 0;
  healthyPercentage = 0;
  updatedAt: Date | null = null;
  loading = false;
  errorMessage = '';
  products: Product[] = [];
  showMovementForm = false;
  movementType: 'Entrada' | 'Salida' = 'Entrada';
  movementProductId: number | null = null;
  movementQuantity = 1;
  movementNotes = '';
  savingMovement = false;

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly router: Router,
    private readonly database: DatabaseService,
  ) {
  addIcons({
    addOutline,
    alertCircleOutline,
    arrowDownCircleOutline,
    arrowUpCircleOutline,
    barChartOutline,
    barcodeOutline,
    chevronDownOutline,
    chevronForwardOutline,
    cubeOutline,
    flashOutline,
    homeOutline,
    listOutline,
    notificationsOutline,
    personCircleOutline,
    searchOutline,
    swapHorizontalOutline,
    warningOutline,
  });
}

  get filteredMovements(): Movement[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query
      ? this.movements.filter((movement) => movement.product.toLowerCase().includes(query))
      : this.movements;
  }
  
    goToProductos(): void {
      void this.router.navigate(['/productos'], { queryParams: { add: '1' } });
    }

    openMovementForm(type: 'Entrada' | 'Salida'): void {
      this.movementType = type;
      this.movementProductId = this.products[0]?.id ?? null;
      this.movementQuantity = 1;
      this.movementNotes = '';
      this.errorMessage = '';
      this.showMovementForm = true;
    }

    closeMovementForm(): void {
      if (!this.savingMovement) this.showMovementForm = false;
    }

    async saveMovement(): Promise<void> {
      if (!this.movementProductId || !Number.isInteger(this.movementQuantity) || this.movementQuantity < 1) {
        this.errorMessage = 'Selecciona un producto y una cantidad válida.';
        return;
      }

      this.savingMovement = true;
      this.errorMessage = '';
      try {
        await axios.post(API_ENDPOINTS.movimientos, {
          product_id: this.movementProductId,
          type: this.movementType,
          quantity: this.movementQuantity,
          notes: this.movementNotes.trim() || null,
        }, { timeout: 10000 });
        this.showMovementForm = false;
        await this.loadDashboard();
      } catch (error: unknown) {
        this.errorMessage = axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'No se pudo registrar el movimiento.';
      } finally {
        this.savingMovement = false;
        this.changeDetector.detectChanges();
      }
    }

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
  this.loading = true;
  this.errorMessage = '';

  try {
    await this.database.init();
    const cachedDashboard = this.database.isAvailable
      ? await this.database.getDashboard()
      : null;

    if (cachedDashboard) {
      this.totalProducts = cachedDashboard.totalProducts;
      this.lowStock = cachedDashboard.lowStock;
      this.outOfStock = cachedDashboard.outOfStock;
      this.healthyPercentage = cachedDashboard.healthyPercentage;
      this.movements = cachedDashboard.recentMovements;
      this.updatedAt = new Date(cachedDashboard.updatedAt);
    }

    const response = await axios.get<DashboardResponse>(API_ENDPOINTS.dashboard, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'No se pudo cargar el dashboard.');
    }

    const dashboard = response.data.data;

    this.totalProducts = dashboard.totalProducts;
    this.lowStock = dashboard.lowStock;
    this.outOfStock = dashboard.outOfStock;
    this.healthyPercentage = dashboard.healthyPercentage;
    this.movements = dashboard.recentMovements ?? [];
    this.updatedAt = dashboard.updatedAt
      ? new Date(dashboard.updatedAt)
      : null;

    const productsResponse = await axios.get<{ success: boolean; data?: Product[] }>(API_ENDPOINTS.productos, {
      timeout: 10000,
    });
    if (productsResponse.data.success && productsResponse.data.data) {
      this.products = productsResponse.data.data.map((product) => ({
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        available: Number(product.available),
      }));
    }

    if (this.database.isAvailable) {
      await this.database.saveDashboard({
        totalProducts: this.totalProducts,
        lowStock: this.lowStock,
        outOfStock: this.outOfStock,
        healthyPercentage: this.healthyPercentage,
        recentMovements: this.movements,
        updatedAt: dashboard.updatedAt,
      });
    }
  } catch (error: unknown) {
    console.error('Error al cargar dashboard:', error);

    if (this.movements.length === 0) {
      this.errorMessage =
        axios.isAxiosError<{ error?: string }>(error) &&
        error.response?.data?.error
          ? error.response.data.error
          : 'No se pudo cargar el dashboard desde la API.';
    }
  } finally {
    this.loading = false;

    // Actualiza la pantalla después de responder Axios.
    this.changeDetector.detectChanges();
  }
}

}
