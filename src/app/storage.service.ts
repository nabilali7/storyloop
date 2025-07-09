// src/app/services/storage.service.ts

import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Define the structure of a saved game object
export interface SavedGame {
  id: string;          // Unique ID for the game
  story: string;       // The full story text so far
  options: string[];   // The last set of options presented
  lastUpdated: number; // A timestamp for sorting and display
}

const SAVED_GAMES_KEY = 'saved_games';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async getAllGames(): Promise<SavedGame[]> {
    const savedData = await this.get(SAVED_GAMES_KEY);
    return savedData ? JSON.parse(savedData) : [];
  }

  async saveGame(gameToSave: SavedGame): Promise<void> {
    const allGames = await this.getAllGames();
    const gameIndex = allGames.findIndex(g => g.id === gameToSave.id);

    if (gameIndex > -1) {
      // Game already exists, update it
      allGames[gameIndex] = gameToSave;
    } else {
      // It's a new game, add it to the list
      allGames.push(gameToSave);
    }
    
    // Sort games by most recently updated
    allGames.sort((a, b) => b.lastUpdated - a.lastUpdated);

    await this.set(SAVED_GAMES_KEY, JSON.stringify(allGames));
  }

  async deleteGame(gameId: string): Promise<void> {
    let allGames = await this.getAllGames();
    allGames = allGames.filter(g => g.id !== gameId);
    await this.set(SAVED_GAMES_KEY, JSON.stringify(allGames));
  }

  // --- Hybrid Storage Helper Methods ---

  public async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  }
}