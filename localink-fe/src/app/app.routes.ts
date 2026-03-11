import { Routes } from '@angular/router';
import { RegisterBusinessComponent } from './register-business/register-business.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';

export const routes: Routes = [

  {
    path: '',
    component: RegisterBusinessComponent
  },

  {
    path: 'contact-details',
    component: ContactDetailsComponent
  }

];