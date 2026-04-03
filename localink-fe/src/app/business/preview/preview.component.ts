import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent {

  @Input() businessData: any;
  @Input() contactData: any;
  @Input() hoursData: any[] = [];
  @Input() photoData: string | null = null;
 
}