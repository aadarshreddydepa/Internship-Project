import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { SubcategoryListComponent } from './pages/subcategory-list/subcategory-list.component';
import { BusinessListComponent } from './pages/business-list/business-list.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ClientDashboardComponent } from './dashboards/client-dashboard/client-dashboard.component';
import { RegisterBusinessComponent } from './register-business/register-business.component';
import { UserDashboardComponent } from './dashboards/user-dashboard/user-dashboard.component';
import { EditBusinessBusinessComponent } from './edit-business/edit-business.component';
import { BusinessDetailComponent } from './pages/business-detail/business-detail.component';
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [

  {
    path: '',
    component: LoginComponent
  },
  {
     path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'subcategory/:id',
    component: SubcategoryListComponent
  },
  {
    path: 'businesses/:categoryId/:subcategoryId',
    component: BusinessListComponent
  },
  {
    path:'profile',
    component:ProfileComponent
  },
  {
    path:'change-password',
    component:ChangePasswordComponent,
  },
  {
    path: 'contact-details',
    component: ContactDetailsComponent
  },
  { 
    path: 'user-dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'client-dashboard',
    component: ClientDashboardComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'register-business', 
    component: RegisterBusinessComponent ,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-business/:id',
    component: EditBusinessBusinessComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'categories',
    component:CategoriesComponent
  },
  { 
    path: 'business/:id', 
    component: BusinessDetailComponent 
  },
  {
    path: 'admin-dashboard',
    component : AdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '',
  }
];