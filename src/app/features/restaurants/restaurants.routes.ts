import {Routes} from '@angular/router';

export const RESTAURANTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./restaurants-list/restaurants-list.component').then(m => m.RestaurantsListComponent),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./restaurants-form/restaurants-form.component').then(m => m.RestaurantsFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () =>
            import('./restaurants-form/restaurants-form.component').then(m => m.RestaurantsFormComponent),
    }

];