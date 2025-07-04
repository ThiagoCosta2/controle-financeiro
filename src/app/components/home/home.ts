import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule], // Importar aqui
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
