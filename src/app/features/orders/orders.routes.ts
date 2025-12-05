import {Routes} from '@angular/router';

export const ORDERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./orders-list/orders-list.component').then(m => m.OrdersListComponent),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./orders-form/orders-form.component').then(m => m.OrdersFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () =>
            import('./orders-form/orders-form.component').then(m => m.OrdersFormComponent),
    }
]