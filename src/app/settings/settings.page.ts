import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [IonicModule]
})
export class SettingsPage {
  userName = 'Jane Doe';
  userPhotoURL = 'assets/path-to-profile.jpg';

  constructor(private router: Router) { }

  goHome() {
    this.router.navigate(['/home']);
  }

  openSecurity() {
    this.router.navigate(['/settings/security']);
  }

  openAbout() {
    this.router.navigate(['/settings/about']);
  }
}
