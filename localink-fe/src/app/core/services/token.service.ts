import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  setToken(token: string) {

    localStorage.setItem("jwt_token", token);
    console.log("Token stored in LocalStorage");
  }

  getToken() {

    return localStorage.getItem("jwt_token");

  }
  clearToken() {

    localStorage.removeItem("jwt_token");
  }
}