import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./search/search.component').then(m => m.SearchComponent)
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      )
  },

  {
    path: '**',
    redirectTo: ''
  }

];