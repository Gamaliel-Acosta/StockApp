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
import { Router } from '@angular/router';
import { DatabaseService, Movement, Product } from '../services/database.service';
import { ConnectivityService } from '../services/connectivity.service';
import { InventoryApiService } from '../services/inventory-api.service';

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
    private readonly connectivity: ConnectivityService,
    private readonly api: InventoryApiService,
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
        await this.api.createMovement({
          product_id: this.movementProductId,
          type: this.movementType,
          quantity: this.movementQuantity,
          notes: this.movementNotes.trim() || null,
        });
        this.showMovementForm = false;
        await this.loadDashboard();
      } catch (error: unknown) {
        this.errorMessage = this.api.getErrorMessage(error, 'No se pudo registrar el movimiento.');
      } finally {
        this.savingMovement = false;
        this.changeDetector.detectChanges();
      }
    }

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async ionViewWillEnter(): Promise<void> {
    if (!this.loading) await this.loadDashboard();
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

    const dashboard = await this.api.getDashboard();
    this.connectivity.markOnline();

    this.totalProducts = dashboard.totalProducts;
    this.lowStock = dashboard.lowStock;
    this.outOfStock = dashboard.outOfStock;
    this.healthyPercentage = dashboard.healthyPercentage;
    this.movements = dashboard.recentMovements ?? [];
    this.updatedAt = dashboard.updatedAt
      ? new Date(dashboard.updatedAt)
      : null;

    this.products = await this.api.getProducts();

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

    if (this.connectivity.isConnectionError(error)) {
      this.connectivity.markOffline();
    }

    if (this.movements.length === 0) {
      this.errorMessage = this.api.getErrorMessage(error, 'No se pudo cargar el dashboard desde la API.');
    }
  } finally {
    this.loading = false;

    // Actualiza la pantalla después de responder Axios.
    this.changeDetector.detectChanges();
  }
}

}
