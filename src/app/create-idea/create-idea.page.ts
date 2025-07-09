// src/app/create-idea/create-idea.page.ts
import { Component, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-create-idea',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './create-idea.page.html',
  styleUrls: ['./create-idea.page.scss'],
})
export class CreateIdeaPage {
  userPrompt = '';
  story = '';
  loading = false;
  liked = false;
  isListening = false;

  private partialResultsListener: PluginListenerHandle | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location,
    private zone: NgZone
  ) { }

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
    const hasPermission = await this.checkAndRequestPermission();
    if (!hasPermission) {
      alert('Microphone permission is required to use this feature.');
      return;
    } this.isListening = true;
    await this.registerPartialResultsListener();

    while (this.isListening) {
      try {
        await SpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          popup: false,
        });
      } catch (error) {
        console.error('Speech recognition error in loop:', error);
        // If an error occurs, break the loop.
        this.isListening = false;
        break;
      }
    }
    // Once the loop is broken, ensure listeners are cleaned up.
    await this.removePartialResultsListener();
  }



  private async stopListening() {
    if (!this.isListening) return;

    // Setting this to false is the key to breaking the 'while' loop
    this.isListening = false;

    // Manually stop the currently active recognition session.
    await SpeechRecognition.stop();
  }


  private async registerPartialResultsListener() {
    this.partialResultsListener = await SpeechRecognition.addListener('partialResults', (data: any) => {
      this.zone.run(() => {
        if (data.matches && data.matches.length > 0) {
          // To make it feel like dictation, we should append rather than replace
          // For simplicity and matching your last version, we'll keep it as replace.
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
