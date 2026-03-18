import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter, Output, Input} from '@angular/core';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent {

  @Input() initialPhoto: string | null = null;
  @Output() photoSelected = new EventEmitter<string>();
  selectedImage: string | null = null;
  errorMessage = '';

  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  maxFileSize = 10 * 1024 * 1024; // 10MB
  
  ngOnInit() {
    if(this.initialPhoto){
      this.selectedImage = this.initialPhoto;
    }
  }
  onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }
    this.processFile(input.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files.length) return;
    const file = event.dataTransfer.files[0];
    this.processFile(file);
  }

  processFile(file: File) {

    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG, JPEG, and PNG files are allowed.';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'Image must be smaller than 10MB.';
      return;
    }

    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result as string;
      this.photoSelected.emit(this.selectedImage);
    };

    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedImage = null;
    localStorage.removeItem('businessPhoto');
  }

}