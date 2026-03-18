import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  login(data: any): Observable<any> {

    const dummyEmail = "test@gmail.com";
    const dummyPassword = "Test@123";

    if (data.usernameOrEmail === dummyEmail && data.password === dummyPassword) {

      const token = this.generateJWT(data);

      console.log("Generated JWT Token:");
      console.log(token);

      return of({ token: token });

    } else {

      return throwError(() => new Error("Invalid credentials"));

    }
  }

  generateJWT(payload: any): string {

    const header = {
      alg: "HS256",
      typ: "JWT"
    };

    const body = {
      email: payload.usernameOrEmail,
      role: payload.userType,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(body));
    const signature = btoa("dummySignature");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

}