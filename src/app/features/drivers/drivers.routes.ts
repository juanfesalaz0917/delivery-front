import {Routes} from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./drivers-list/drivers-list.component').then(m => m.DriverListComponent)
    },
    {
        path: 'new',
        loadComponent: () => import('./drivers-form/drivers-form.component').then(m => m.DriverFormComponent)
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./drivers-form/drivers-form.component').then(m => m.DriverFormComponent)
    }
]