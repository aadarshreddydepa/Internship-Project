import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HoursComponent } from "./business/hours/hours.component";
import { PhotoUploadComponent } from "./business/photo-upload/photo-upload.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}