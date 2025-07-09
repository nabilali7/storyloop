import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
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
  ) { }

  openSettings(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl('/settings');
  }

  async startPreGame() {
    // 2. Trigger the haptic feedback
    try {
      // Use ImpactStyle.Light for a subtle but noticeable tap feedback
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn("Haptic feedback not available on this device/platform.");
    }

    // 3. Navigate to the next page as before
    this.router.navigateByUrl('/pre-game');
  }
}
