import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  @Input() businessData: any;
  @Input() contactData: any;
  @Input() hoursData: any[] = [];
  @Input() photoData: string | null = null;

}