import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pre-game',
  templateUrl: './new-game.page.html',
  styleUrls: ['./new-game.page.scss'],
  standalone: true,
  // Updated imports for the new design
  imports: [IonicModule, CommonModule, FormsModule]
})
export class NewGamePage {

  // Inject the Router to handle navigation
  constructor(private router: Router) { }

  goHome() {
    // Navigate back to the home/start screen
    this.router.navigateByUrl('/home');
  }

  generateIdea() {
    // Placeholder for new game logic
    this.router.navigateByUrl('/generate-idea');
  }

  createIdea() {
    this.router.navigateByUrl('/create-idea');
  }

  generateLocationIdea() {
    // Placeholder for load game logic
    console.log('Generating an idea based on your location...');
    // Example: this.router.navigateByUrl('/load-menu');
  }
}