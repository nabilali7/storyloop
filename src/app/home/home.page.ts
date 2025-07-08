import { Component } from '@angular/core';
import { Router }      from '@angular/router';
import { PopoverController, IonicModule } from '@ionic/angular';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController
  ) {}

  // prevent the content click when tapping settings
  openSettings(event: Event) {
    event.stopPropagation();
    // show a settings popover or navigate:
    this.popoverCtrl.create({
      component: SettingsPage, // import & declare your settings component
      event: event
    }).then(pop => pop.present());
  }

  startPreGame() {
    // navigate to your “Pre-game” page
    this.router.navigateByUrl('/pre-game');
  }
}
