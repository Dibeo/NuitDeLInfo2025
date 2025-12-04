import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import UserProgressRepository from '../../../core/UserProgressAPI/UserProgressRepository';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-podium',
  imports: [],
  templateUrl: './podium.component.html',
  styleUrl: './podium.component.css',
})
export class PodiumComponent implements OnInit, OnDestroy {
  private _users: Array<{ id: string; xp: number }> = [];
  private _intervalId: any;

  @ViewChild('chart')
  public chartElement!: ElementRef;
  public chartInstance: any = null;

  public get users() {
    return this._users;
  }

  public set users(value) {
    this._users = value;
    this.renderChart();
  }

  public async ngOnInit(): Promise<void> {
    await this.fetchUsers();
    this._intervalId = setInterval(async () => {
      await this.fetchUsers();
    }, 5000);
  }

  public ngOnDestroy(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private async fetchUsers(): Promise<void> {
    this.users = await UserProgressRepository.getAll();
  }

  public renderChart(): void {
    if (!this.chartElement || !this.users.length) return;

    if (this.chartInstance) {
      const labels = this.users.map((u) => u.id);
      const data = this.users.map((u) => u.xp);

      const backgroundColors = this.users.map((_, index) => this.getBackGroundColor(index));
      const borderColors = backgroundColors.map((c) => c.replace('0.6', '1').replace('0.8', '1'));

      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].backgroundColor = backgroundColors;
      this.chartInstance.data.datasets[0].borderColor = borderColors;
      this.chartInstance.update();
    } else {
      this.createChart();
    }
  }

  private getBackGroundColor(rank: number): string {
    if (rank === 0) return 'rgba(255, 215, 0, 0.8)';
    if (rank === 1) return 'rgba(192, 192, 192, 0.8)';
    if (rank === 2) return 'rgba(205, 127, 50, 0.8)';
    return 'rgba(75, 192, 192, 0.6)';
  }

  private createChart(): void {
    const labels = this.users.map((u) => u.id);
    const data = this.users.map((u) => u.xp);

    const backgroundColors = this.users.map((_, index) => this.getBackGroundColor(index));
    const borderColors = backgroundColors.map((c) => c.replace('0.6', '1').replace('0.8', '1'));

    this.chartInstance = new Chart(this.chartElement.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'XP',
            data: data,
            borderWidth: 2,
            borderRadius: 5,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Classement XP' },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
}
