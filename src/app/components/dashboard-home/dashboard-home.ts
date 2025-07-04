import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent {
  areValuesVisible: boolean = true;

  constructor(private router: Router) {}

  toggleValuesVisibility(): void {
    this.areValuesVisible = !this.areValuesVisible;
  }

  // ATUALIZADO: Navega para a página de transações com um parâmetro para abrir o popup
  goToAddTransaction(): void {
    this.router.navigate(['/dashboard/transactions'], {
      queryParams: { openPopup: 'true' },
    });
  }
}
