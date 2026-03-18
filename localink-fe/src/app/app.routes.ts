import { Routes } from '@angular/router';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SubcategoryListComponent } from './pages/subcategory-list/subcategory-list.component';
import { BusinessListComponent } from './pages/business-list/business-list.component';
// import { BusinessDetailComponent } from './pages/business-detail/business-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { RegisterBusinessComponent } from './register-business/register-business.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { EditBusinessBusinessComponent } from './edit-business/edit-business.component';


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
    component: RegisterBusinessComponent
  },

  {
    path: 'contact-details',component: ContactDetailsComponent
  },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'client-dashboard', component: ClientDashboardComponent },
  { path: 'register-business', component: RegisterBusinessComponent },
  {
  path: 'edit-business/:id',
  component: EditBusinessBusinessComponent
}

];