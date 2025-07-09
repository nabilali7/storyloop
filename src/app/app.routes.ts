import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'pre-game',
    loadComponent: () => import('./pre-game/pre-game.page').then(m => m.PreGamePage)
  },
  {
    path: 'new-game',
    loadComponent: () => import('./new-game/new-game.page').then(m => m.NewGamePage)
  },
  {
    path: 'generate-idea',
    loadComponent: () => import('./generate-idea/generate-idea.page').then(m => m.GenerateIdeaPage)
  },
  {
    path: 'create-idea',
    loadComponent: () => import('./create-idea/create-idea.page').then( m => m.CreateIdeaPage)
  },
  {
    path: 'game',
    loadComponent: () => import('./game/game.page').then( m => m.GamePage)
  },
  {
    path: 'generate-location-idea',
    loadComponent: () => import('./generate-location-idea/generate-location-idea.page').then( m => m.GenerateLocationIdeaPage)
  },
  {
    path: 'load-game',
    loadComponent: () => import('./load-game/load-game.page').then( m => m.LoadGamePage)
  },
];
