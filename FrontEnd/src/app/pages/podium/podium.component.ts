import { Component } from '@angular/core';
import UserProgressRepository from '../../../core/UserProgressAPI/UserProgressRepository';

@Component({
  selector: 'app-podium',
  imports: [],
  templateUrl: './podium.component.html',
  styleUrl: './podium.component.css',
})
export class PodiumComponent {
  public currentXp: number = 0;

  public async addXp(): Promise<void> {
    this.currentXp = await UserProgressRepository.addXp(1);
  }

  public async getXp(): Promise<void> {
    this.currentXp = await UserProgressRepository.getXp();
    console.log(await UserProgressRepository.getAll());
  }
}
