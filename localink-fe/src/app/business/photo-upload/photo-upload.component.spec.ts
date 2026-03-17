import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoUploadComponent } from './photo-upload.component';
import { By } from '@angular/platform-browser';

describe('PhotoUploadComponent', () => {

  let component: PhotoUploadComponent;
  let fixture: ComponentFixture<PhotoUploadComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [PhotoUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  // Component Creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Valid Image Upload
  it('should accept a valid JPG image', () => {

    const file = new File(['dummy'], 'image.jpg', { type: 'image/jpeg' });

    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.errorMessage).toBe('');
  });

  // Reject Invalid File Type
  it('should reject invalid file types', () => {

    const file = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });

    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.errorMessage).toContain('Only JPG, JPEG, and PNG files are allowed');
  });

  // Reject Large File
  it('should reject file larger than 5MB', () => {

    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    );

    const event = {
      target: {
        files: [largeFile]
      }
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.errorMessage).toContain('Image size must be less than 5MB');
  });

  //  Image Stored Locally
  it('should store uploaded image in localStorage', (done) => {

    const file = new File(['dummy'], 'image.png', { type: 'image/png' });

    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    spyOn(localStorage, 'setItem');

    component.onFileSelected(event);

    setTimeout(() => {

      expect(localStorage.setItem).toHaveBeenCalled();
      done();

    }, 100);

  });

  // Image Preview Appears
  it('should display preview after valid upload', (done) => {

    const file = new File(['dummy'], 'image.png', { type: 'image/png' });

    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);

    setTimeout(() => {

      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));

      expect(img).not.toBeNull();

      done();

    }, 100);

  });

  // Handle No File Selected
  it('should handle empty file selection safely', () => {

    const event = {
      target: {
        files: []
      }
    } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedImage).toBeNull();

  });

});