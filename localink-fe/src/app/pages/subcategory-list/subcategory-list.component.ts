import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubcategoryService } from '../../services/subcategory.service';
import { BusinessListService } from '../../services/business-list.service';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.css']
})
export class SubcategoryListComponent implements OnInit {

  categoryId: string = '';
  subcategories: any[] = [];
constructor(
  private route: ActivatedRoute,
  private subcategoryService: SubcategoryService,
  private businessService: BusinessListService
) {}
displayCategoryName = '';
categoryNames: any = {
  medical: "Medical",
  food: "Food & Dining",
  general: "General Store",
  tutoring: "Tutoring",
  repair: "Repair Services",
  home: "Home & Garden"
};
ngOnInit(): void {

  this.categoryId = (this.route.snapshot.paramMap.get('id') || '').toLowerCase();

this.displayCategoryName = this.categoryNames[this.categoryId] || this.categoryId;

  this.subcategoryService.getSubcategories().subscribe(subData => {

    const subs = subData[this.categoryId] || [];

    this.businessService.getBusinesses().subscribe(businessData => {

      this.subcategories = subs.map((sub: any) => {

        const key = sub.name.toLowerCase();

        const count =
          businessData[this.categoryId]?.[key]?.length || 0;

        return {
          ...sub,
          count
        };

      });

    });

  });

}

}