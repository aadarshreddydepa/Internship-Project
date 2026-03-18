import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotForm!: FormGroup;
  message = "";

  constructor(private fb: FormBuilder, private router: Router){

    this.forgotForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
          )
        ]
      ]
    });

  }

  submit(){

    if(this.forgotForm.invalid){
      return;
    }

    // Dummy logic (replace with API later)
    this.message = "Reset link sent to your email";

    setTimeout(()=>{
      this.router.navigate(['/']);
    },2000);

  }

}