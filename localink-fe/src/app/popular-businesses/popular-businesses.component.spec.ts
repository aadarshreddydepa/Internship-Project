import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopularBusinessesComponent } from './popular-businesses.component';
import { PopularService, PopularBusiness } from '../services/popular.service';

describe('PopularBusinessesComponent', () => {

  let component: PopularBusinessesComponent;
  let fixture: ComponentFixture<PopularBusinessesComponent>;
  let service: PopularService;

  const mockBusinesses: PopularBusiness[] = [
    { id: 1, name: 'City Clinic',   category: 'Medical',       rating: 4.0, image: '' },
    { id: 2, name: 'Tasty Bites',   category: 'Food & Dining', rating: 4.5, image: '' },
    { id: 3, name: 'Home Repairs',  category: 'Repair',        rating: 3.5, image: '' },
    { id: 4, name: 'Math Masters',  category: 'Tutoring',      rating: 5.0, image: '' }
  ];

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [PopularBusinessesComponent],
      providers: [PopularService]
    }).compileComponents();

    fixture = TestBed.createComponent(PopularBusinessesComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(PopularService);

    spyOn(service, 'getPopularBusinesses').and.returnValue(mockBusinesses);

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load businesses from service on init', () => {
    expect(service.getPopularBusinesses).toHaveBeenCalled();
    expect(component.businesses.length).toBe(4);
  });

  it('should render a card for each business', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.business-card');
    expect(cards.length).toBe(mockBusinesses.length);
  });

  it('should display business name in each card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = compiled.querySelectorAll('.card-content h3');
    expect(headings[0].textContent?.trim()).toBe('City Clinic');
  });

  it('should display business category in each card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categories = compiled.querySelectorAll('.category');
    expect(categories[1].textContent?.trim()).toBe('Food & Dining');
  });

  // --- getStars helper ---

  it('should return 5 full stars for rating 5', () => {
    expect(component.getStars(5)).toBe('★★★★★');
  });

  it('should return 4 full stars and 1 empty star for rating 4', () => {
    expect(component.getStars(4)).toBe('★★★★☆');
  });

  it('should return 4 full stars and a half star for rating 4.5', () => {
    expect(component.getStars(4.5)).toBe('★★★★⯨');
  });

  it('should return 3 full stars, half star and 1 empty for rating 3.5', () => {
    expect(component.getStars(3.5)).toBe('★★★⯨☆');
  });

  it('should return all empty stars for rating 0', () => {
    expect(component.getStars(0)).toBe('☆☆☆☆☆');
  });

});