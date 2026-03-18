import { Component } from '@angular/core';
import { SignupComponent } from './pages/signup/signup.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HoursComponent } from "./business/hours/hours.component";
import { PhotoUploadComponent } from "./business/photo-upload/photo-upload.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}