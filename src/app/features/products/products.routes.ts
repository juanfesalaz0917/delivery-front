import {Routes} from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./products-list/products-list.component').then(m => m.ProductsListComponent),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./products-form/products-form.component').then(m => m.ProductsFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () =>
            import('./products-form/products-form.component').then(m => m.ProductsFormComponent),
    }
];