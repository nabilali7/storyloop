// src/app/create-idea/create-idea.page.ts
import { Component, NgZone, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-create-idea',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './create-idea.page.html',
  styleUrls: ['./create-idea.page.scss'],
})
export class CreateIdeaPage implements OnDestroy {
  userPrompt = '';
  story = '';
  loading = false;
  liked = false;
  isListening = false;

  private partialResultsListener: PluginListenerHandle | null = null;
  private webSpeechRecognition: any | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private zone: NgZone
  ) {
    if (!Capacitor.isNativePlatform()) {
      this.initializeWebSpeech();
    }
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  async toggleListening() {
    if (this.isListening) {
      // If we are currently listening, stop it.
      await this.stopListening();
    } else {
      // If we are not listening, start it.
      await this.startListening();
    }
  }

  private async startListening() {
    this.isListening = true;
    if (Capacitor.isNativePlatform()) {
      // --- NATIVE LOGIC ---
      const hasPermission = await this.checkNativePermission();
      if (!hasPermission) {
        this.isListening = false;
        alert('Microphone permission is required.');
        return;
      }
      await this.registerPartialResultsListener();
      await SpeechRecognition.start({
        language: 'en-US',
        partialResults: true,
        popup: false,
      });
    } else {
      // --- WEB LOGIC ---
      if (this.webSpeechRecognition) {
        this.webSpeechRecognition.start();
      } else {
        this.isListening = false;
        alert('Speech recognition is not supported on this browser.');
      }
    }
  }



  private async stopListening() {
    this.isListening = false;
    if (Capacitor.isNativePlatform()) {
      // --- NATIVE LOGIC ---
      await this.removePartialResultsListener();
      await SpeechRecognition.stop();
    } else {
      // --- WEB LOGIC ---
      if (this.webSpeechRecognition) {
        this.webSpeechRecognition.stop();
      }
    }
  }


  private async checkNativePermission(): Promise<boolean> {
    const status = await SpeechRecognition.checkPermissions();
    if (status.speechRecognition === 'granted') return true;
    const permission = await SpeechRecognition.requestPermissions();
    return permission.speechRecognition === 'granted';
  }

  private async registerPartialResultsListener() {
    this.partialResultsListener = await SpeechRecognition.addListener('partialResults', (data: any) => {
      this.zone.run(() => {
        if (data.matches && data.matches.length > 0) {
          this.userPrompt = data.matches[0];
        }
      });
    });
  }

  private async removePartialResultsListener() {
    if (this.partialResultsListener) {
      await this.partialResultsListener.remove();
      this.partialResultsListener = null;
    }
  }

  private async checkAndRequestPermission(): Promise<boolean> {
    const status = await SpeechRecognition.checkPermissions();
    if (status.speechRecognition === 'granted') return true;

    const permission = await SpeechRecognition.requestPermissions();
    return permission.speechRecognition === 'granted';
  }

  private initializeWebSpeech() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      this.webSpeechRecognition = new SpeechRecognitionAPI();
      this.webSpeechRecognition.continuous = true;
      this.webSpeechRecognition.interimResults = true;
      this.webSpeechRecognition.lang = 'en-US';

      this.webSpeechRecognition.onresult = (event: any) => {
        let final_transcript = '';
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
        // Update the prompt inside the zone to ensure UI updates
        this.zone.run(() => {
          this.userPrompt = final_transcript + interim_transcript;
        });
      };

      this.webSpeechRecognition.onerror = (event: any) => {
        console.error('Web Speech API error:', event.error);
        this.zone.run(() => { this.isListening = false; });
      };

      this.webSpeechRecognition.onend = () => {
        this.zone.run(() => { this.isListening = false; });
      };
    }
  }

  ngOnDestroy() {
    if (this.isListening) {
      this.stopListening();
    }
  }

  /** Send prompt to your single-shot /api/generateIdea endpoint :contentReference[oaicite:3]{index=3} */
  async generateStory() {
    if (!this.userPrompt.trim()) { return; }
    this.loading = true;
    this.story = '';

    const instruction =
      `You are a concise text-adventure story generator. ` +
      `Given the user prompt, return a 1–2 sentence story preview. ` +
      `Prompt: ${this.userPrompt}`;

    try {
      const res = await firstValueFrom(
        await this.http.post<{ idea: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/generateIdea',
          { prompt: instruction }
        )
      );
      this.story = res.idea.trim();
    } catch (e) {
      console.error(e);
      this.story = 'Error generating story. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async likeStory() {
    if (!this.story) return;
    this.loading = true;

    try {
      // 1) reset memory (expect plain text, not JSON)
      await firstValueFrom(
        this.http.post(
          'https://dodo-novel-conversely.ngrok-free.app/api/reset',
          {},
          { responseType: 'text' }    // ← add this
        )
      );

      // 2) push user’s prompt
      await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          { message: this.userPrompt }
        )
      );

      // 3) push AI’s intro
      await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          { message: this.story }
        )
      );

      // 4) navigate
      this.router.navigate(['/game'], {
        state: { initialStory: this.story }
      });

    } catch (e) {
      console.error('Failed to seed memory', e);
    } finally {
      this.loading = false;
    }
  }
}
