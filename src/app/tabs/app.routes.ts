import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () =>
      import('../login-pipe').then((m) => m.LoginPipe),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../productos/productos.page').then(
        (m) => m.ProductosPage
      ),
  },

  {
    path: 'tabs',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./tabs.routes').then((m) => m.routes),
  },
];