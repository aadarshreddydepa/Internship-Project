import { TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[SearchComponent]
    }).compileComponents();
  });

  it('should create search component', () => {

    const fixture = TestBed.createComponent(SearchComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();

  });

});