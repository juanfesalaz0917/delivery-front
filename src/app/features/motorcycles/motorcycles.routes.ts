import {Routes} from '@angular/router';

export const MOTORCYCLE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./motorcycle-list/motorcycle-list.component').then(m => m.MotorcyclesListComponent)
    },
    {
        path: 'new',
        loadComponent: () => import('./motorcycle-form/motorcycle-form.component').then(m => m.MotorcyclesFormComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./motorcycle-form/motorcycle-form.component').then(m => m.MotorcyclesFormComponent)
    }
]