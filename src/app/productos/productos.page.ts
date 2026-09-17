import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';
interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  available: number;
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
  imports: [IonContent, IonIcon, IonSearchbar, CommonModule, FormsModule],
})
export class ProductosPage implements OnInit {
  searchTerm = '';

  products: Product[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly changeDetector: ChangeDetectorRef) {
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
      this.products = this.products.filter((item) => item.id !== product.id);
    } catch {
      this.errorMessage = 'No se pudo eliminar el producto.';
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const { data } = await axios.get<Product[]>(API_ENDPOINTS.productos, { timeout: 10000 });
      this.products = data.map((product) => ({
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        available: Number(product.available),
      }));
    } catch (error: unknown) {
      this.errorMessage = axios.isAxiosError<{ error?: string }>(error) && error.response?.data?.error
        ? String(error.response.data.error)
        : 'No se pudieron cargar los productos desde la API.';
    } finally {
      this.loading = false;
      this.changeDetector.detectChanges();
    }
  }

}
