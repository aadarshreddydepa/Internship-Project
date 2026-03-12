import { Injectable } from '@angular/core';
import businessesData from '../../assets/data/businesses.json';

export type BusinessStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'inactive';

export interface Business {

  id:number;
  name:string;
  description:string;
  category:string;
  contact:string;
  rating:number;
  status:BusinessStatus;
  rejectionComment?:string;

}

@Injectable({
  providedIn:'root'
})
export class BusinessService{
  [x: string]: any;

  private businesses:Business[] = businessesData as Business[];

  getBusinesses(){
    return this.businesses;
  }

  updateStatus(id:number,status:BusinessStatus){

    const business = this.businesses.find(b=>b.id===id);

    if(business){
      business.status = status;
    }

  }

  rejectBusiness(id:number,comment:string){

    const business = this.businesses.find(b=>b.id===id);

    if(business){
      business.status = 'rejected';
      business.rejectionComment = comment;
    }

  }

}