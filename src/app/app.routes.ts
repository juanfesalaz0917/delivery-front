import type { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/customers.routes').then(
        (m) => m.CUSTOMERS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'restaurants',
    loadChildren: () =>
      import('./features/restaurants/restaurants.routes').then(
        (m) => m.RESTAURANTS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'menus',
    loadChildren: () =>
      import('./features/menus/menus.routes').then(
        (m) => m.MENUS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then(
        (m) => m.PRODUCTS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes').then(
        (m) => m.ORDERS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'motorcycles',
    loadChildren: () =>
      import('./features/motorcycles/motorcycles.routes').then(
        (m) => m.MOTORCYCLE_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'drivers',
    loadChildren: () =>
      import('./features/drivers/drivers.routes').then(
        (m) => m.DRIVERS_ROUTES,
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
