import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }
  setUser(name: string) {
  localStorage.setItem('username', name);
}

getUser() {
  return localStorage.getItem('username');
}

  logout() {
    localStorage.removeItem('token');
  }
  setRefreshToken(token: string) {
  localStorage.setItem('refreshToken', token);
}

getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

clear() {
  localStorage.clear();
}
}