import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StorageService } from '../storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage {
  userName = 'Set Name';
  userPhotoURL: string | undefined = 'assets/icon/Portrait_Placeholder.png';
  isEditingName = false;

  constructor(private router: Router, private storageService: StorageService) { }


  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    const savedName = await this.storageService.get('user_name');
    const savedPhoto = await this.storageService.get('user_photo');

    if (savedName) {
      this.userName = savedName;
    }
    if (savedPhoto) {
      this.userPhotoURL = savedPhoto;
    }
  }

  async changePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64, // Easiest for storage
        source: CameraSource.Prompt // Asks user to choose Camera or Gallery
      });

      if (image.base64String) {
        // Create a displayable image string from the base64 data
        this.userPhotoURL = `data:image/jpeg;base64,${image.base64String}`;
        await this.saveProfile();
      }
    } catch (error) {
      console.error("Error taking photo", error);
    }
  }

  startNameEdit() {
    this.isEditingName = true;
  }

  async saveName() {
    this.isEditingName = false;
    if (this.userName.trim() === '') {
      this.userName = 'Set Name'; // Reset if empty
    }
    await this.saveProfile();
  }

  async saveProfile() {
    await this.storageService.set('user_name', this.userName);
    if (this.userPhotoURL) {
      await this.storageService.set('user_photo', this.userPhotoURL);
    }
    console.log('Profile saved!');
  }

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
