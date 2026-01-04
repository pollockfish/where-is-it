import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private static http: HttpClient;

  constructor(http: HttpClient) {
    ApiService.http = http;
  }

  static async getEmails(): Promise<any> {
    try {
      const response = await fetch('http://localhost:3000/api/get-stored-emails').then(res => res.json());
      return response;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }
}