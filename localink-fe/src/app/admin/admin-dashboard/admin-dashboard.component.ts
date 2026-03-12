import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

import { BusinessService,Business } from '../../services/business.service';

type Section = 'pending' | 'approved' | 'rejected' | 'inactive';

@Component({
  selector:'app-admin-dashboard',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl:'./admin-dashboard.component.html',
  styleUrl:'./admin-dashboard.component.css'
})
export class AdminDashboardComponent{

  businesses:Business[] = [];

  currentSection:Section = 'pending';

  searchTerm='';

  selectedBusiness:Business|null=null;

  toastMessage='';
  showToast=false;

  rejectModalOpen=false;
  rejectComment='';
  rejectBusinessId:number|null=null;

  constructor(private service:BusinessService){}

  ngOnInit(){
    this.businesses = this.service.getBusinesses();
  }

  get filteredBusinesses(){

    return this.businesses
    .filter(b=>b.status===this.currentSection)
    .filter(b=>
      b.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

  }

  approve(id:number){
    this.service.updateStatus(id,'approved');
    this.notify('Business Approved');
  }

  deactivate(id:number){
    this.service.updateStatus(id,'inactive');
    this.notify('Business Deactivated');
  }

  activate(id:number){
    this.service.updateStatus(id,'approved');
    this.notify('Business Activated');
  }

  openRejectModal(id:number){
    this.rejectBusinessId = id;
    this.rejectModalOpen = true;
  }

  submitRejection(){

    if(!this.rejectComment.trim()) return;

    if(this.rejectBusinessId!==null){

      this.service.rejectBusiness(
        this.rejectBusinessId,
        this.rejectComment
      );

    }

    this.rejectModalOpen=false;
    this.rejectComment='';
    this.rejectBusinessId=null;

    this.notify('Business Rejected');

  }

  closeRejectModal(){
    this.rejectModalOpen=false;
    this.rejectComment='';
  }

  openDetails(b:Business){
    this.selectedBusiness=b;
  }

  closeModal(){
    this.selectedBusiness=null;
  }

  notify(message:string){

    this.toastMessage = message;
    this.showToast=true;

    setTimeout(()=>{
      this.showToast=false;
    },2500)

  }

  downloadExcel(){

    const data = this.filteredBusinesses;

    if(data.length===0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook,worksheet,"Businesses");

    XLSX.writeFile(workbook,`${this.currentSection}-businesses.xlsx`);

  }

}