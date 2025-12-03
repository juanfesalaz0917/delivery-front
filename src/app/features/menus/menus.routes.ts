import {Routes} from '@angular/router';

export const MENUS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./menus-list/menus-list.component').then(m => m.MenusListComponent),
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./menus-form/menus-form.component').then(m => m.MenusFormComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () =>
            import('./menus-form/menus-form.component').then(m => m.MenusFormComponent),
    }
];