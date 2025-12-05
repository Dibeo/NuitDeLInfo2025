import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import UserProgressRepository from '../core/UserProgressAPI/UserProgressRepository';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('FrontEnd');

  public ngOnInit(): void {
    UserProgressRepository.addXp(1);
  }

  @HostListener('window:beforeunload')
  public onPageUnload(): void {
    UserProgressRepository.resetXp();
  }
}
