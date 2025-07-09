import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService, SavedGame } from '../storage.service';

@Component({
  selector: 'app-load-game',
  templateUrl: './load-game.page.html',
  styleUrls: ['./load-game.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoadGamePage implements OnInit {
  savedGames: SavedGame[] = [];

  constructor(
    private storageService: StorageService,
    private router: Router,
    private location: Location
  ) { }

  async ngOnInit() {
    await this.loadSavedGames();
  }

  async loadSavedGames() {
    this.savedGames = await this.storageService.getAllGames();
  }

  getStoryPreview(story: string): string {
    return story.length > 100 ? story.substring(0, 100) + '...' : story;
  }

  loadGame(game: SavedGame) {
    // Navigate to the game page, passing the entire saved game object
    this.router.navigate(['/game'], {
      state: { loadedGame: game }
    });
  }

  async deleteGame(event: MouseEvent, gameId: string) {
    event.stopPropagation(); // Prevent the card's click event from firing
    await this.storageService.deleteGame(gameId);
    await this.loadSavedGames(); // Refresh the list
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
}