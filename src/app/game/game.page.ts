import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  story = '';
  options: string[] = [];
  loading = false;

  showCustom = false;
  customInput = '';

  @ViewChild('customGroup', { read: ElementRef }) customGroup!: ElementRef;

  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient
  ) {
    // 1. Try the Router’s Navigation extras
    const navState = this.router.getCurrentNavigation()?.extras.state as any;
    // 2. Fallback to the Location history state
    const locState = this.location.getState() as any;
    // 3. Use whichever has `initialStory`
    this.story = navState?.initialStory ?? locState?.initialStory ?? '';

    if (!this.story) {
      // only redirect if *still* no story
      this.router.navigateByUrl('/home');
    }
  }

  ngOnInit() {
    this.fetchOptions();
  }

  goBack() {
    this.location.back();
  }

  private async fetchOptions() {
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          {
            message: `
            Generate EXACTLY three numbered options for the player’s next move.

            • Each option must be a single concise phrase of NO MORE than FIVE words.
            • No full sentences—just noun-verb or verb-noun phrases.
            • Do NOT add any extra text, explanation, or punctuation (no periods at the end).

            Format your reply like:
            1. Phrase one
            2. Phrase two
            3. Phrase three
      `.trim()
          })
      );
      const lines = res.reply
        .split(/\r?\n/)
        .map(l => l.replace(/\*\*/g, '').trim())  // strip **bold**
        .filter(l => !!l);                         // drop blanks

      const unique = Array.from(new Set(lines));
      this.options = unique.slice(0, 3);

    } catch (e) {
      console.error('fetchOptions failed', e);
      this.options = [];
    } finally {
      this.loading = false;
    }
  }

  async choose(option: string) {
    this.loading = true;
    try {
      const prompt =
        `Continue this text-adventure story. The user chose:\n"${option}"\n\n` +
        `Previous story:\n${this.story}\n\n` +
        `Please respond with FIRST a single short simple language paragraph (1-2 sentences) continuing the story, ` +
        `then EXACTLY three simple short direct numbered options (no more than 10 words) for the text adventure in separate lines, in the form:\n` +
        `1. Option one\n2. Option two\n3. Option three\n` +
        `Do NOT include any extra text, headers, or markdown.`;
      const res = await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          { message: prompt }
        )
      );
      this.parseResponse(res.reply);
    } catch (e) {
      console.error('choose failed', e);
    } finally {
      this.loading = false;
    }
  }

  activateCustom(event: MouseEvent) {
    event.stopPropagation();
    this.showCustom = true;
    this.customInput = '';
  }

  async sendCustom() {
    if (!this.customInput.trim()) return;
    this.loading = true;
    this.showCustom = false;
    try {
      const prompt =
        `Continue this text-adventure story. The user chose:\n"${this.customInput}"\n\n` +
        `Previous story:\n${this.story}\n\n` +
        `Please respond with FIRST a single short simple language paragraph (1-2 sentences) continuing the story, ` +
        `then EXACTLY three simple short direct numbered options (no more than 10 words) for the text adventure on separate lines, in the form:\n` +
        `1. Option one\n2. Option two\n3. Option three\n` +
        `Do NOT include any extra text, headers, or markdown.`;
      const res = await firstValueFrom(
        this.http.post<{ reply: string }>(
          'https://dodo-novel-conversely.ngrok-free.app/api/chat',
          { message: prompt }
        )
      );
      this.parseResponse(res.reply);
      await this.fetchOptions();
    } catch (e) {
      console.error('sendCustom failed', e);
    } finally {
      this.loading = false;
    }
  }

  private parseResponse(full: string) {
    // normalize lines and remove empty
    const lines = full
      .split(/\r?\n/)
      .map(l => l.trim().replace(/\*\*/g, '')) // strip **bold**
      .filter(l => !!l);

    // find first numbered line
    const idx = lines.findIndex(l => /^\d+\.\s/.test(l));

    let newPara = '';
    let opts: string[] = [];

    if (idx >= 0) {
      // paragraph = lines[0..idx)
      newPara = lines.slice(0, idx).join(' ');
      // options = lines[idx..idx+3]
      opts = lines.slice(idx)
        .map(l => l.replace(/^\d+\.\s*/, ''))
      //.slice(0, 3);
    } else {
      // fallback: treat everything as one para
      newPara = lines.join(' ');
    }

    // append the new paragraph to story
    this.story = newPara.trim();

    // replace current options
    if (opts.length === 3) {
      this.options = opts;
    }
    const unique = Array.from(new Set(opts));
    this.options = unique.slice(0, 3);
    // otherwise leave last options intact
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (
      this.showCustom &&
      this.customGroup?.nativeElement &&
      !this.customGroup.nativeElement.contains(ev.target)
    ) {
      this.showCustom = false;
    }
  }
}
