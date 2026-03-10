import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HoursComponent } from "./business/hours/hours.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HoursComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'localink-fe';
}
