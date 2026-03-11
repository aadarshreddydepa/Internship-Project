import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MOCK_BUSINESSES } from '../../data/mock-businesses';
@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.css']
})
export class SubcategoryListComponent {

  categoryName = '';

  subcategoryMap: any = {

    Medical: [
      { name: 'Clinic' },
      { name: 'Pharmacy' },
      { name: 'Diagnostic Center' },
      { name: 'Dental Clinic' },
      { name: 'Eye Care' },
      { name: 'Physiotherapy' }
    ],

    "Food & Dining": [
      { name: 'Restaurant' },
      { name: 'Cafe' },
      { name: 'Fast Food' },
      { name: 'Catering' },
      { name: 'Bakery' },
      { name: 'Food Truck' }
    ],

    "General Store": [
      { name: 'Supermarket' },
      { name: 'Convenience Store' },
      { name: 'Grocery' },
      { name: 'Department Store' },
      { name: 'Organic Store' }
    ],

    Tutoring: [
      { name: 'Math Tutor' },
      { name: 'Science Tutor'},
      { name: 'Language Classes' },
      { name: 'Music Lessons' },
      { name: 'Art Classes' },
      { name: 'Coding Classes' }
    ],

    "Repair Services": [
      { name: 'Phone Repair' },
      { name: 'Computer Repair' },
      { name: 'Appliance Repair' },
      { name: 'Car Repair'},
      { name: 'Plumbing'},
      { name: 'Electrical' }
    ],

    "Home & Garden": [
      { name: 'Interior Design'},
      { name: 'Furniture'},
      { name: 'Gardening' },
      { name: 'Cleaning Services' },
      { name: 'Pest Control' }
    ]

  };

  subcategories: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      this.categoryName = params.get('category') || '';

      this.subcategories = (this.subcategoryMap[this.categoryName] || []).map((sub: any) => ({
  ...sub,
  count: (MOCK_BUSINESSES[sub.name] || []).length
}));

    });

  }

}