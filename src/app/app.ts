import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink], // Adicione RouterLink aqui
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true, // também importante garantir que seja standalone
})
export class App {
  protected title = 'controle-financeiro';
}
