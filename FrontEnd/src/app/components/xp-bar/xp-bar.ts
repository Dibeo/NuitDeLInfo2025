import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import UserProgressRepository from '../../../core/UserProgressAPI/UserProgressRepository';

const FETCH_WAIT_TIME: number = 2000;

@Component({
  selector: 'xp-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xp-bar.html',
  styleUrl: './xp-bar.css',
})
export class XpBar implements OnInit, OnDestroy {
  @Input() public maxXp: number = 15;
  public currentXp: number = 0;

  private _intervalId: any;

  constructor(private changeDetector: ChangeDetectorRef) {}

  public async ngOnInit(): Promise<void> {
    await this.updateXp();
    this._intervalId = setInterval(async () => {
      await this.updateXp();
    }, FETCH_WAIT_TIME);
  }

  public ngOnDestroy(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  private async updateXp(): Promise<void> {
    this.currentXp = await UserProgressRepository.getXp();
    this.changeDetector.detectChanges();
  }

  public get heightPercentage(): string {
    if (this.maxXp === 0) return '0%';
    const percentage = (this.currentXp / this.maxXp) * 100;
    return `${Math.min(percentage, 100)}%`;
  }
}
