// src/app/services/notification.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define os tipos de notificação que podemos ter
export type NotificationType = 'success' | 'error' | 'info';

// Define a estrutura de uma notificação
export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private subject = new BehaviorSubject<Notification | null>(null);
  public notification$: Observable<Notification | null> =
    this.subject.asObservable();

  // Método que seus componentes chamarão para mostrar uma mensagem
  public show(message: string, type: NotificationType = 'info'): void {
    this.subject.next({ message, type });

    // A mensagem some sozinha depois de 4 segundos
    setTimeout(() => this.clear(), 4000);
  }

  public clear(): void {
    this.subject.next(null);
  }
}
