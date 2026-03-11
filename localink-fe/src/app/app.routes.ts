import { Routes } from '@angular/router';
import { SubcategoryListComponent } from './pages/subcategory-list/subcategory-list.component';
import { BusinessListComponent } from './pages/business-list/business-list.component';

export const routes: Routes = [

  {
    path: 'subcategories/:category',
    component: SubcategoryListComponent
  },

  {
    path: 'businesses/:subcategory',
    component: BusinessListComponent
  }

];