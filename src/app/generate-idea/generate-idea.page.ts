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
  liked = false;

  // Inject HttpClient directly—no extra service needed
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

  likeIdea() {
    console.log('Liked idea:', this.idea);
    // you can extend this to actually save “likes” later
  }

  likeStory() {
    this.liked = !this.liked;
  }

  async generateRandomIdea() {
    this.loading = true;
    this.idea = '';

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
          'http://192.168.31.1:3000/api/generateIdea',
          { prompt: instruction }
        )
      );
      this.idea = res.idea;
    } catch (e) {
      console.error(e);
      this.idea = 'Fehler beim Generieren – bitte prüfe deine Verbindung.';
    } finally {
      this.loading = false;
    }
  }
}
