import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [

{
path: '',
component: SearchComponent
},

{
path: 'admin',
component: AdminDashboardComponent
}

];