// Authentication service for login and registration API calls.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(
    'http://localhost:8080/login',
    data,
    { responseType: 'text' } 
    );
  }

  register(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }
}
