import { Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SubcategoryListComponent } from './pages/subcategory-list/subcategory-list.component';
import { BusinessListComponent } from './pages/business-list/business-list.component';
// import { BusinessDetailComponent } from './pages/business-detail/business-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';

export const routes: Routes = [

  {
    path: '',
    component: CategoriesComponent
  },

  {
    path: 'subcategory/:id',
    component: SubcategoryListComponent
  },

  {
    path: 'businesses/:category/:subcategory',
    component: BusinessListComponent
  },
  

{
  path:'profile',
  component:ProfileComponent
},
//   {
//   path: 'business/:name',
//   component: BusinessDetailComponent
// }
 {
 path:'change-password',
 component:ChangePasswordComponent
}

];