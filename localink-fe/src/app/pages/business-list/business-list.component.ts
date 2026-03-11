import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MOCK_BUSINESSES } from '../../data/mock-businesses';

@Component({
  selector:'app-business-list',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./business-list.component.html',
  styleUrls:['./business-list.component.css']
})
export class BusinessListComponent{

subcategory='';
businesses:any[]=[];

constructor(private route:ActivatedRoute){}

ngOnInit(){

this.route.paramMap.subscribe(params=>{

this.subcategory=params.get('subcategory') || '';

this.businesses=MOCK_BUSINESSES[this.subcategory] || [];

});

}

}