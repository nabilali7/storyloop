// src/app/generate-location-idea/generate-location-idea.page.ts

import { Component, OnInit, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

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
    private location: Location,
    private zone: NgZone
  ) { }

  async ngOnInit() {
    await this.generateLocationIdea();
  }

  goHome() { this.router.navigateByUrl('/home'); }
  goBack() { this.location.back(); }

  // 'Like' function to start the game.
  async likeIdea() {
    if (!this.idea || this.loading || this.idea.startsWith('Could not')) return;
    this.liked = true;
    this.loading = true;
    try {
      await firstValueFrom(this.http.post('https://dodo-novel-conversely.ngrok-free.app/api/reset', {}, { responseType: 'text' }));
      await firstValueFrom(this.http.post<{ reply: string }>('https://dodo-novel-conversely.ngrok-free.app/api/chat', { message: this.idea }));
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

  /**
   * Production-ready function to get location and generate an idea.
   */
  async generateLocationIdea() {
    this.loading = true;
    this.idea = '';
    this.liked = false;
    this.statusMessage = 'Requesting location access...';

    try {
      let position: Position;

      // Check which platform we're on
      if (Capacitor.isNativePlatform()) {
        console.log("Running on native platform...");
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location !== 'granted') {
          throw new Error('Location permission was denied on your device.');
        }
        position = await Geolocation.getCurrentPosition();
      } else {
        console.log("Running on web platform...");
        position = await this.getWebGeolocation();
      }

      // From here, the logic is the same for both platforms
      console.log('Coordinates received:', position.coords);
      this.statusMessage = 'Location found! Generating idea...';
      const { latitude, longitude } = position.coords;

      // ===================================================================
      // RE-ENABLED: The AI call block is now active.
      // ===================================================================
      const instruction = `
        You are a creative text-adventure story generator. 
        A user is located at Latitude ${latitude} and Longitude ${longitude}. 
        First, IDENTIFY the specific city, town, or notable region for these coordinates (e.g., "Zurich, Switzerland," "the Mojave Desert," "Kyoto, Japan").
        Next, state this location clearly to the user. For example: "You are in Kyoto, Japan."
        DO NOT mention the specific coordinates in your response.
        Finally, based on the SPECIFIC identified location, create an intriguing 1-2 sentence story preview that could start a text adventure game. The story should feel connected to the known characteristics, history, or atmosphere of that place.
      `;

      const res = await firstValueFrom(this.http.post<{ idea: string }>(
        'https://dodo-novel-conversely.ngrok-free.app/api/generateIdea',
        { prompt: instruction.trim() }
      ));

      if (!res?.idea) {
        throw new Error("The AI returned an empty or invalid response. Please try again.");
      }

      this.idea = res.idea.trim();
      this.statusMessage = '';
      // ===================================================================

    } catch (e: any) {
      console.error('Error during location generation:', e);
      this.idea = e.message || 'An unknown error occurred.';
      this.statusMessage = '';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Helper function for the browser Geolocation API.
   */
  private getWebGeolocation(): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      this.zone.run(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos as Position);
          },
          (err) => {
            let message = "Could not get location.";
            if (err.code === 1) message = "Location access was denied.";
            if (err.code === 2) message = "Position is unavailable.";
            if (err.code === 3) message = "Request timed out.";
            reject(new Error(message));
          }
        );
      });
    });
  }
}