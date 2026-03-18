import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private router: Router) {}

  editMode = false;

  countries = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Singapore',
    'Japan'
  ];

  statesByCountry: any = {
    India: ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
      'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
      'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
      'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
      'Uttarakhand','West Bengal'
    ],
    'United States': ['California','Texas','Florida','New York'],
    'United Kingdom': ['England','Scotland','Wales','Northern Ireland'],
    Canada: ['Ontario','Quebec'],
    Australia: ['New South Wales','Victoria'],
    Germany: ['Bavaria','Berlin'],
    France: ['Île-de-France'],
    Singapore: ['Central Region'],
    Japan: ['Tokyo','Osaka']
  };

  states: string[] = [];

  countryPhoneConfig:any = {
    'India': { code: '+91', digits: 10 },
    'United States': { code: '+1', digits: 10 },
    'Canada': { code: '+1', digits: 10 },
    'United Kingdom': { code: '+44', digits: 10 },
    'Australia': { code: '+61', digits: 9 },
    'Germany': { code: '+49', digits: 11 },
    'France': { code: '+33', digits: 9 },
    'Singapore': { code: '+65', digits: 8 },
    'Japan': { code: '+81', digits: 10 }
  };

  // 🔥 PINCODE CONFIG
  pincodeConfig:any = {
    'India': { length: 6 },
    'United States': { length: 5 },
    'Canada': { length: 6 },
    'United Kingdom': { length: 6 },
    'Australia': { length: 4 },
    'Germany': { length: 5 },
    'France': { length: 5 },
    'Singapore': { length: 6 },
    'Japan': { length: 7 }
  };

  phoneCode = '+91';
  phoneMaxLength = 10;

  user = {
    username: 'sekhar',
    email: 'rsaichandrasekhar@gmail.com',
    phone: '9100314277',
    address: {
      country: 'India',
      state: 'Karnataka',
      street: 'Sarakki market, JP Nagar',
      city: 'Bengaluru',
      pincode: '560078'
    }
  };

  phoneInvalid = false;
  emailInvalid = false;
  pincodeInvalid = false;
  fieldsInvalid = false;

  ngOnInit(){
    this.states = this.statesByCountry[this.user.address.country];
  }

  enableEdit(){
    this.editMode = true;
  }

  saveProfile() {
    this.validatePhone();
    this.validateEmail();
    this.validatePincode();

    const requiredValid = this.validateRequiredFields();

    if (this.phoneInvalid || this.emailInvalid || this.pincodeInvalid || !requiredValid) {
      return;
    }

    this.editMode = false;
  }

  validatePhone(){
    if(!this.user.phone){
      this.phoneInvalid = false;
      return;
    }

    if(!/^[0-9]+$/.test(this.user.phone) ||
       this.user.phone.length !== this.phoneMaxLength){
      this.phoneInvalid = true;
      return;
    }

    this.phoneInvalid = false;
  }

  validateEmail(){
    const regex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailInvalid = !regex.test(this.user.email);
  }

  validatePincode(){
    const pin = this.user.address.pincode;
    const country = this.user.address.country;

    if(!pin){
      this.pincodeInvalid = false;
      return;
    }

    if(!/^[0-9]+$/.test(pin)){
      this.pincodeInvalid = true;
      return;
    }

    const requiredLength = this.pincodeConfig[country]?.length;

    if(requiredLength && pin.length !== requiredLength){
      this.pincodeInvalid = true;
      return;
    }

    this.pincodeInvalid = false;
  }

  validateRequiredFields() {
    const addr = this.user.address;

    if (
      !this.user.username?.trim() ||
      !this.user.email?.trim() ||
      !this.user.phone?.trim() ||
      !addr.country?.trim() ||
      !addr.state?.trim() ||
      !addr.street?.trim() ||
      !addr.city?.trim() ||
      !addr.pincode?.trim()
    ) {
      this.fieldsInvalid = true;
      return false;
    }

    this.fieldsInvalid = false;
    return true;
  }

  allowOnlyNumbers(event:any){
    if(!/[0-9]/.test(event.key)){
      event.preventDefault();
    }
  }

  preventPaste(event:any){
    const data = event.clipboardData.getData('text');
    if(!/^[0-9]+$/.test(data)){
      event.preventDefault();
    }
  }

  onCountryChange(){
    this.states = this.statesByCountry[this.user.address.country] || [];

    this.user.address.state = '';
    this.user.address.street = '';
    this.user.address.city = '';
    this.user.address.pincode = '';

    const config = this.countryPhoneConfig[this.user.address.country];

    this.phoneCode = config.code;
    this.phoneMaxLength = config.digits;

    setTimeout(() => {
      this.validatePhone();
      this.validatePincode();
    });
  }

  openPasswordForm(){
    this.router.navigate(['/change-password']);
  }

}