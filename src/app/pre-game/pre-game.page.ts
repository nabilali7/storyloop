import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pre-game',
  templateUrl: './pre-game.page.html',
  styleUrls: ['./pre-game.page.scss'],
  standalone: true,
  // Updated imports for the new design
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PreGamePage {

  // Inject the Router to handle navigation
  constructor(private router: Router) { }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  newGame() {
    this.router.navigateByUrl('/new-game');
  }

  loadGame() {
    this.router.navigateByUrl('/load-game');
  }
}