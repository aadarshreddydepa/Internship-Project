import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusinessListService } from '../../services/business-list.service';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-detail.component.html'
})
export class BusinessDetailComponent implements OnInit {

  business: any;

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessListService
  ) {}

  ngOnInit() {

    const name = this.route.snapshot.queryParamMap.get('name');

    this.businessService.getBusinesses().subscribe(data => {
      this.business = data.find((b:any) => b.name === name);
    });

  }

}