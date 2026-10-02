import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonApp, IonIcon, IonRouterOutlet, IonSearchbar, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDownOutline, cloudDoneOutline, cloudOfflineOutline, cubeOutline, homeOutline, listOutline, notificationsOutline, personCircleOutline, searchOutline, swapHorizontalOutline } from 'ionicons/icons';
import { filter, skip } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DatabaseService } from './services/database.service';
import { ConnectivityService } from './services/connectivity.service';
import { ProductSyncService } from './services/product-sync.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, FormsModule, IonApp, IonIcon, IonRouterOutlet, IonSearchbar, RouterLink, RouterLinkActive],
})
export class AppComponent implements OnInit {
  private readonly database = inject(DatabaseService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly productSync = inject(ProductSyncService);
  private readonly toastController = inject(ToastController);
  private readonly router = inject(Router);
  readonly offlineMode$ = this.connectivity.offlineMode$;
  searchTerm = '';
  isAuthenticatedRoute = false;
  isNavigationMenuOpen = false;

  constructor() {
    addIcons({ chevronDownOutline, cloudDoneOutline, cloudOfflineOutline, cubeOutline, homeOutline, listOutline, notificationsOutline, personCircleOutline, searchOutline, swapHorizontalOutline });
  }

  async ngOnInit(): Promise<void> {
    this.connectivity.start();
    this.productSync.start();
    this.connectivity.offlineMode$.pipe(skip(1)).subscribe((isOffline) => {
      void this.showConnectivityToast(isOffline);
    });
    this.updateNavigation(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateNavigation(event.urlAfterRedirects));
    await this.database.init();
  }

  private async showConnectivityToast(isOffline: boolean): Promise<void> {
    const toast = await this.toastController.create({
      message: isOffline
        ? 'Sin conexión. La aplicación está usando SQLite en modo offline.'
        : 'Conexión restaurada. Los datos se cargarán desde el servidor.',
      duration: 3500,
      position: 'top',
      color: isOffline ? 'warning' : 'success',
      icon: isOffline ? 'cloud-offline-outline' : 'cloud-done-outline',
    });
    await toast.present();
  }

  private updateNavigation(url: string): void {
    this.isAuthenticatedRoute = !url.startsWith('/login');
    this.isNavigationMenuOpen = false;
  }

  toggleNavigationMenu(): void {
    this.isNavigationMenuOpen = !this.isNavigationMenuOpen;
  }

  closeNavigationMenu(): void {
    this.isNavigationMenuOpen = false;
  }
}
