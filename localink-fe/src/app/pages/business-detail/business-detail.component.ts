import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusinessListService } from '../../services/business-list.service';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './business-detail.component.html',
  styleUrls:['./business-detail.component.css']
})
export class BusinessDetailComponent implements OnInit {

  business: any;
  categoryName = '';
  subcategoryName = '';
  categoryId!: number;

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessListService
  ) {}

subcategoryId!: number;

  ngOnInit() {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.categoryName =
      this.route.snapshot.queryParamMap.get('categoryName') || '';

    this.subcategoryName =
      this.route.snapshot.queryParamMap.get('subcategoryName') || '';

    this.subcategoryId = Number(
      this.route.snapshot.queryParamMap.get('subcategoryId')
    );
    this.categoryId = Number(
      this.route.snapshot.queryParamMap.get('categoryId')
    );
    this.businessService.getBusinessById(id).subscribe({
      next: (data: any) => {

        const primaryPhoto = data.photos?.find((p: any) => p.isPrimary);

        this.business = {
          ...data,
          primaryImage: primaryPhoto
            ? 'http://localhost:5138' + primaryPhoto.imageUrl
            : null
        };

      }
    });
  }
}