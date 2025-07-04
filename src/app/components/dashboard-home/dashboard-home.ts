import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css'],
})
export class DashboardHomeComponent {
  // A nova propriedade para controlar a visibilidade dos valores.
  // Começa como 'true' para que os valores sejam visíveis por padrão.
  areValuesVisible: boolean = true;

  // Método para alternar a visibilidade.
  toggleValuesVisibility(): void {
    this.areValuesVisible = !this.areValuesVisible;
  }
}
