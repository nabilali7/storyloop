// src/app/generate-location-idea/generate-location-idea.page.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-generate-location-idea',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './generate-location-idea.page.html',
  styleUrls: ['./generate-location-idea.page.scss'],
})
export class GenerateLocationIdeaPage implements OnInit {
  idea = '';
  loading = false;
  liked = false;
  statusMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.generateLocationIdea();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goBack() {
    this.location.back();
  }

  async likeIdea() {
    if (!this.idea || this.loading || this.idea.startsWith('Could not')) return;
    
    this.liked = true;
    this.loading = true;

    try {
      await firstValueFrom(
        this.http.post('https://dodo-novel-conversely.ngrok-free.app/api/reset', {}, { responseType: 'text' })
      );
      await firstValueFrom(
        this.http.post<{ reply: string }>('https://dodo-novel-conversely.ngrok-free.app/api/chat', { message: this.idea })
      );
      this.router.navigate(['/game'], { state: { initialStory: this.idea } });
    } catch (e) {
      console.error('Failed to seed memory and start game', e);
      this.liked = false;
    } finally {
      if (this.router.url.includes('/generate-location-idea')) {
          this.loading = false;
      }
    }
  }

  async generateLocationIdea() {
    this.loading = true;
    this.idea = '';
    this.liked = false;
    this.statusMessage = 'Requesting location access...';

    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      this.statusMessage = 'Location found! Generating idea...';

      // ===================================================================
      // FIX: This is the new, safer prompt that is less likely to be
      // blocked by the AI's safety filters.
      // ===================================================================
      const instruction =
        `You are a creative text-adventure story generator. ` +
        `A user is located at Latitude ${latitude} and Longitude ${longitude}. ` +
        `First, INFER the general type of environment for these coordinates (e.g., "a bustling city," "a quiet coastal town," "a remote forest," "a suburban neighborhood"). ` +
        `DO NOT mention the specific coordinates in your response. ` +
        `Based ONLY on the inferred environment type, create an intriguing 1-2 sentence story preview that could start a text adventure game.`;
      
      const res = await firstValueFrom(
        this.http.post<{ idea: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/generateIdea',
          { prompt: instruction }
        )
      );

      // Check for an empty or failed response from the API
      if (!res || !res.idea) {
        throw new Error("The AI returned an empty response. This might be due to safety filters. Please try regenerating.");
      }

      this.idea = res.idea.trim();
      this.statusMessage = '';

    } catch (e: any) {
      console.error(e);
      let errorMessage = 'Could not generate an idea. An unknown error occurred.';
      if (e.code) {
        switch (e.code) {
          case 1: errorMessage = "Location access was denied. Please allow location access to use this feature."; break;
          case 2: errorMessage = "Your location could not be determined. Please check your connection."; break;
          case 3: errorMessage = "The request for your location timed out."; break;
        }
      } else if (e.message) {
        // Capture errors from the API call itself
        errorMessage = e.message;
      }
      this.idea = errorMessage;
      this.statusMessage = '';
    } finally {
      this.loading = false;
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
}