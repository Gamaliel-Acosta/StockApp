import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonApp, IonIcon, IonRouterOutlet, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDownOutline, cubeOutline, homeOutline, notificationsOutline, personCircleOutline, searchOutline, swapHorizontalOutline } from 'ionicons/icons';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, FormsModule, IonApp, IonIcon, IonRouterOutlet, IonSearchbar, RouterLink, RouterLinkActive],
})
export class AppComponent implements OnInit {
  private readonly database = inject(DatabaseService);
  private readonly router = inject(Router);
  searchTerm = '';
  isAuthenticatedRoute = false;

  constructor() {
    addIcons({ chevronDownOutline, cubeOutline, homeOutline, notificationsOutline, personCircleOutline, searchOutline, swapHorizontalOutline });
  }

  async ngOnInit(): Promise<void> {
    this.updateNavigation(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateNavigation(event.urlAfterRedirects));
    await this.database.init();
  }

  private updateNavigation(url: string): void {
    this.isAuthenticatedRoute = !url.startsWith('/login');
  }
}
