import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import axios from 'axios';
import { ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '../config/api.config';
import { DatabaseService, Product } from '../services/database.service';

interface ProductsResponse {
  success: boolean;
  message: string;
  data?: Product[];
}

interface NewProduct {
  name: string;
  code: string;
  price: number | null;
  available: number | null;
}

import {
  addOutline,
  alertCircleOutline,
  barcodeOutline,
  chevronDownOutline,
  cubeOutline,
  homeOutline,
  createOutline,
  listOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  swapHorizontalOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  imports: [IonContent, IonIcon, CommonModule, FormsModule],
})
export class ProductosPage implements OnInit {
  searchTerm = '';
  showAddForm = false;
  saving = false;
  newProduct: NewProduct = this.createEmptyProduct();

  products: Product[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly database: DatabaseService,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({
      addOutline,
      alertCircleOutline,
      barcodeOutline,
      chevronDownOutline,
      cubeOutline,
      homeOutline,
      createOutline,
      listOutline,
      notificationsOutline,
      personCircleOutline,
      searchOutline,
      swapHorizontalOutline,
      trashOutline,
      warningOutline,
    });
  }

  get filteredProducts(): Product[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query
      ? this.products.filter((product) =>
          `${product.name} ${product.code}`.toLowerCase().includes(query),
        )
      : this.products;
  }

  getStatus(product: Product): 'available' | 'low' | 'empty' {
    if (product.available === 0) return 'empty';
    if (product.available <= 10) return 'low';
    return 'available';
  }

  async removeProduct(product: Product): Promise<void> {
    if (!window.confirm(`¿Eliminar ${product.name}?`)) return;
    this.errorMessage = '';
    try {
      await axios.delete(`${API_ENDPOINTS.productos}/${product.id}`, { timeout: 10000 });
      await this.database.deleteProduct(product.id);
      this.products = this.products.filter((item) => item.id !== product.id);
    } catch {
      this.errorMessage = 'No se pudo eliminar el producto.';
    }
  }

  openAddForm(): void {
    this.newProduct = this.createEmptyProduct();
    this.errorMessage = '';
    this.showAddForm = true;
  }

  closeAddForm(): void {
    if (!this.saving) this.showAddForm = false;
  }

  async addProduct(): Promise<void> {
    const name = this.newProduct.name.trim();
    const code = this.newProduct.code.trim();
    const price = Number(this.newProduct.price);
    const available = Number(this.newProduct.available ?? 0);

    if (!name || !code || !Number.isFinite(price) || price < 0 || !Number.isInteger(available) || available < 0) {
      this.errorMessage = 'Completa nombre, código, precio y una cantidad válida.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    try {
      const response = await axios.post<Product>(API_ENDPOINTS.productos, {
        name,
        code,
        price,
        available,
      }, { timeout: 10000 });
      const product = {
        ...response.data,
        id: Number(response.data.id),
        price: Number(response.data.price),
        available: Number(response.data.available),
      };

      this.products = [...this.products, product].sort((first, second) => first.name.localeCompare(second.name));
      if (this.database.isAvailable) await this.database.saveProducts(this.products);
      this.showAddForm = false;
      this.newProduct = this.createEmptyProduct();
    } catch (error: unknown) {
      this.errorMessage = axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error
        ? String(error.response.data.error)
        : 'No se pudo agregar el producto.';
    } finally {
      this.saving = false;
      this.changeDetector.detectChanges();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
    if (this.route.snapshot.queryParamMap.get('add') === '1') this.openAddForm();
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.database.init();
      if (this.database.isAvailable) {
        this.products = await this.database.getProducts();
      }

      const response = await axios.get<ProductsResponse>(API_ENDPOINTS.productos, {
        timeout: 10000,
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'No se pudieron cargar los productos.');
      }

      const products = response.data.data.map((product) => ({
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        available: Number(product.available),
      }));

      if (this.database.isAvailable) {
        await this.database.saveProducts(products);
      }
      this.products = products;
    } catch (error: unknown) {
      if (this.products.length === 0) {
        this.errorMessage = axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'No se pudieron cargar los productos desde la API.';
      }
    } finally {
      this.loading = false;
      this.changeDetector.detectChanges();
    }
  }

  private createEmptyProduct(): NewProduct {
    return { name: '', code: '', price: null, available: 0 };
  }

}
