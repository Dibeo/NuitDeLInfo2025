import { Component, ElementRef, ViewChild } from '@angular/core';
import UserProgressRepository from '../../../core/UserProgressAPI/UserProgressRepository';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-podium',
  imports: [],
  templateUrl: './podium.component.html',
  styleUrl: './podium.component.css',
})
export class PodiumComponent {
  private intervalId: any;

  private users: Array<{ id: string; xp: number }> = [];

  @ViewChild('chart')
  public chartElement!: ElementRef;
  public chartInstance: any = null;

  public ngOnInit(): void {
    this.intervalId = setInterval(async () => {
      await this.fetchUsers();
      this.renderChart();
    }, 5000);
  }

  public ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async fetchUsers(): Promise<void> {
    this.users = await UserProgressRepository.getAll();
  }

  public renderChart(): void {
    if (!this.chartElement || !this.users.length) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const labels = this.users.map((u) => 'x');
    const data = this.users.map((u) => u.xp);

    const backgroundColors = this.users.map((_, index) => {
      if (index === 0) return 'rgba(255, 215, 0, 0.6)';
      if (index === 1) return 'rgba(192, 192, 192, 0.6)';
      if (index === 2) return 'rgba(205, 127, 50, 0.6)';
      return 'rgba(75, 192, 192, 0.6)';
    });

    this.chartInstance = new Chart(this.chartElement.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'XP',
            data: data,
            borderWidth: 1,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((c) => c.replace('0.6', '1')),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Classement XP' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}
