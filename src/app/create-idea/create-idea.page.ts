// src/app/create-idea/create-idea.page.ts
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  startSpeech() { }

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
