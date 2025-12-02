import type { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/customers-list.component').then(
        (m) => m.CustomersListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form/customers-form.component').then(
        (m) => m.CustomersFormComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./form/customers-form.component').then(
        (m) => m.CustomersFormComponent,
      ),
  },
];
