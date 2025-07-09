// src/app/generate-idea/generate-idea.page.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-generate-idea',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './generate-idea.page.html',
  styleUrls: ['./generate-idea.page.scss'],
})
export class GenerateIdeaPage implements OnInit {
  idea = '';
  loading = false;
  liked = false; // Add this to track the like state for the icon

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.generateRandomIdea();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goBack() {
    this.location.back();
  }

  /**
   * FIX: This function is now implemented to start a new game.
   * It resets the backend memory, seeds it with the generated idea,
   * and navigates to the game page.
   */
  async likeIdea() {
    if (!this.idea || this.loading) return;
    
    this.liked = true; // Provides immediate visual feedback
    this.loading = true;

    try {
      // 1) Reset the backend memory for a new game session
      await firstValueFrom(
        this.http.post(
          'https://dodo-novel-conversely.ngrok-free.app/api/reset',
          {},
          { responseType: 'text' }
        )
      );

      // 2) Seed the memory with the generated story idea
      // Since there's no user prompt here, we only push the AI's intro.
      await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          { message: this.idea }
        )
      );

      // 3) Navigate to the game page, passing the story in the state
      // The game page looks for `initialStory` in the state.
      this.router.navigate(['/game'], {
        state: { initialStory: this.idea }
      });

    } catch (e) {
      console.error('Failed to seed memory and start game', e);
      this.liked = false; // Revert like state on error
    } finally {
      // Don't set loading to false here, as the page is navigating away.
      // If navigation fails, the user is stuck on a loading screen,
      // so we should handle that case.
      if (this.router.url.includes('/generate-idea')) {
          this.loading = false;
      }
    }
  }

  async generateRandomIdea() {
    this.loading = true;
    this.idea = '';
    this.liked = false; // Reset like state for new idea

    const instruction =
      `You are a concise text-adventure story generator. ` +
      `Given the user prompt, return a 1–2 sentence story preview. ` +
      `Make the text compatible with the actual game that would need 3 options.` +
      `The same text will be then used to create 3 options later on so keep that in mind when creating the story..` +
      `So that the user can choose whether they want to continue with that idea or not.` +
      `Only output the story text and try to lead the user into the story.`;

    try {
      const res = await firstValueFrom(
        this.http.post<{ idea: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/generateIdea',
          { prompt: instruction }
        )
      );
      this.idea = res.idea;
    } catch (e) {
      console.error(e);
      this.idea = 'Error generating idea. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}