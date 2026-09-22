import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import axios from 'axios';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../config/api.config';
import { DatabaseService, Movement } from '../services/database.service';

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
  imports: [IonButton, IonContent, IonIcon, IonSearchbar, RouterLink, CommonModule, FormsModule],
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
    void this.router.navigate(['/productos']);
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

    const { data } = await axios.get<{
      totalProducts: number;
      lowStock: number;
      outOfStock: number;
      healthyPercentage: number;
      recentMovements: Movement[];
      updatedAt: string;
    }>(API_ENDPOINTS.dashboard, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    this.totalProducts = data.totalProducts;
    this.lowStock = data.lowStock;
    this.outOfStock = data.outOfStock;
    this.healthyPercentage = data.healthyPercentage;
    this.movements = data.recentMovements ?? [];
    this.updatedAt = data.updatedAt
      ? new Date(data.updatedAt)
      : null;

    if (this.database.isAvailable) {
      await this.database.saveDashboard({
        totalProducts: this.totalProducts,
        lowStock: this.lowStock,
        outOfStock: this.outOfStock,
        healthyPercentage: this.healthyPercentage,
        recentMovements: this.movements,
        updatedAt: data.updatedAt,
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
