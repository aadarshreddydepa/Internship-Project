import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router'; // ✅ IMPORTANT
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../core/services/auth.service';
import { TokenService } from '../core/services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ ADD THIS
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  errorMessage = "";
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      userType: ['', Validators.required],

      usernameOrEmail: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/
          )
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
          )
        ]
      ]

    });

  }

  togglePassword(){
    this.showPassword = !this.showPassword;
  }

  login(){

    if(this.loginForm.invalid){
      return;
    }

    const loginData = this.loginForm.value;

    this.authService.login(loginData)
    .subscribe({

      next: (res) => {
        this.tokenService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },

      error: () => {
        this.errorMessage = "Invalid username/email or password";
      }

    });

  }

}