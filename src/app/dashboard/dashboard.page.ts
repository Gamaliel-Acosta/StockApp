import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSearchbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
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

interface Movement {
  product: string;
  type: 'Entrada' | 'Salida';
  date: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [IonContent, IonIcon, IonSearchbar, CommonModule, FormsModule],
})
export class DashboardPage implements OnInit {
  searchTerm = '';

  readonly movements: Movement[] = [
    { product: 'Teclado mecánico RGB', type: 'Entrada', date: 'Hoy, 10:42', icon: 'barcode-outline' },
    { product: 'Monitor LED 24 pulgadas', type: 'Salida', date: 'Hoy, 09:18', icon: 'barcode-outline' },
    { product: 'Mouse inalámbrico', type: 'Salida', date: 'Ayer, 16:35', icon: 'barcode-outline' },
    { product: 'Cable HDMI 2.1', type: 'Entrada', date: 'Ayer, 11:07', icon: 'barcode-outline' },
  ];

  constructor() {
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

  ngOnInit() {
  }

}
