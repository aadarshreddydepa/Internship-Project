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
import { NoAuthGuard } from './guards/no-auth.guard';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

export const routes: Routes = [

  // ═══════════════════════════════════════════
  //  PUBLIC ROUTES (NoAuthGuard — redirect if already logged in)
  // ═══════════════════════════════════════════
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoAuthGuard]
  },

  // ═══════════════════════════════════════════
  //  PROTECTED ROUTES (AuthGuard — any logged-in user)
  // ═══════════════════════════════════════════
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'subcategory/:id',
    component: SubcategoryListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'businesses/:categoryId/:subcategoryId',
    component: BusinessListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'business/:id',
    component: BusinessDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contact-details',
    component: ContactDetailsComponent,
    canActivate: [AuthGuard]
  },

  // ═══════════════════════════════════════════
  //  ROLE-PROTECTED ROUTES (AuthGuard + role check)
  // ═══════════════════════════════════════════

  // ── User Role ──
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user'] }
  },

  // ── Client Role ──
  {
    path: 'client-dashboard',
    component: ClientDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'register-business',
    component: RegisterBusinessComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'edit-business/:id',
    component: EditBusinessBusinessComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] }
  },

  // ── Admin Role ──
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },

  // ═══════════════════════════════════════════
  //  ERROR PAGE
  // ═══════════════════════════════════════════
  {
    path: 'error',
    component: ErrorPageComponent
  },

  // ═══════════════════════════════════════════
  //  CONTACT US PAGE (Public)
  // ═══════════════════════════════════════════
  {
    path: 'contact-us',
    component: ContactUsComponent
  },

  // ═══════════════════════════════════════════
  //  FALLBACK - 404 Not Found
  // ═══════════════════════════════════════════
  {
    path: '**',
    component: ErrorPageComponent,
    data: { errorCode: '404' }
  }
];