// src/app/services/gemini.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

// src/app/services/gemini.service.ts
@Injectable({ providedIn: 'root' })
export class GeminiService {
  // no environment.apiBaseUrl needed
  private url = 'https://dodo-novel-conversely.ngrok-free.app/api/generateIdea';  // or '/api/chat' if that’s your route

  constructor(private http: HttpClient) { }

  generateIdea(prompt: string) {
    return this.http.post<{ reply: string }>(this.url, { message: prompt });
  }
}

