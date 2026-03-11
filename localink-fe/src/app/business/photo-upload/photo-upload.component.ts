import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent {

  selectedImage: string | null = null;
  errorMessage: string = '';

  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  maxFileSize = 5 * 1024 * 1024; // 5MB

  onFileSelected(event: Event) {

    try {

      const input = event.target as HTMLInputElement;

      if (!input.files || input.files.length === 0) {
        return;
      }

      const file = input.files[0];

      // File type validation
      if (!this.allowedTypes.includes(file.type)) {

        this.errorMessage = 'Only JPG, JPEG, and PNG files are allowed.';
        this.selectedImage = null;
        return;

      }

      // File size validation
      if (file.size > this.maxFileSize) {

        this.errorMessage = 'Image size must be less than 5MB.';
        this.selectedImage = null;
        return;

      }

      this.errorMessage = '';

      const reader = new FileReader();

      reader.onload = () => {

        try {

          this.selectedImage = reader.result as string;

          // Dummy local storage
          localStorage.setItem('businessPhoto', this.selectedImage);

        } catch (storageError) {
          console.error('Error saving image to local storage:', storageError);
        }

      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        this.errorMessage = 'Failed to read the selected file.';
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error processing uploaded file:', error);
      this.errorMessage = 'Unexpected error occurred during file upload.';
    }

  }

}