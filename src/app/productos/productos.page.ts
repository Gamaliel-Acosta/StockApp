import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
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

interface Product {
  name: string;
  code: string;
  price: number;
  available: number;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  imports: [IonContent, IonIcon, IonSearchbar, CommonModule, FormsModule],
})
export class ProductosPage implements OnInit {
  searchTerm = '';

  products: Product[] = [
    { name: 'Producto Name', code: '91010304', price: 9, available: 20 },
    { name: 'Prod Name Bajo', code: '91010305', price: 8, available: 8 },
    { name: 'Producto Name 2', code: '91010342', price: 3, available: 110 },
    { name: 'Producto Name 3', code: '81010304', price: 9, available: 0 },
  ];

  constructor() {
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

  removeProduct(product: Product): void {
    this.products = this.products.filter((item) => item.code !== product.code);
  }

  ngOnInit() {
  }

}
