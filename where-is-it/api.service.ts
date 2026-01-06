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
      console.error('Error fetching emails from localhost.', error);
      try{
        const response = await fetch('https://studious-eureka-jgg4qj5wj55hq9w4-3000.app.github.dev/api/get-stored-emails').then(res => res.json());
        return response;
      } catch (error) {
        console.error('Error fetching emails from GitHub Codespaces.', error);
        throw error;
      }
    }
  }
}