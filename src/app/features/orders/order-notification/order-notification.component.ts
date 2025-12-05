import { Component, inject, signal, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderAssignedEvent, WebSocketService } from '../../../core/services/websocket.service';
import { AudioService } from '../../../core/services/audio.service.ts.service';

interface NotificationItem extends OrderAssignedEvent {
  id: string;
  isVisible: boolean;
}

@Component({
  selector: 'app-order-notification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-notification.component.html',
  styleUrls: ['./order-notification.component.css']
})
export class OrderNotificationComponent implements OnInit, OnDestroy {
  private readonly wsService = inject(WebSocketService);
  private readonly audioService = inject(AudioService);
  private subscription?: Subscription;

  notifications = signal<NotificationItem[]>([]);
  soundEnabled = signal(true);

  ngOnInit(): void {
    // Cargar configuración de sonido
    this.soundEnabled.set(this.audioService.isAudioEnabled());

    // Suscribirse a las notificaciones de órdenes asignadas
    this.subscription = this.wsService.orderAssigned$.subscribe(
      (order: OrderAssignedEvent) => {
        this.showNotification(order);
      }
    );

    // Opcional: Unirse a una sala específica
    // this.wsService.joinRoom('motorcycles');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private showNotification(order: OrderAssignedEvent): void {
    // Generar ID único para la notificación
    const notificationId = `${order.order_id}-${Date.now()}`;
    
    const notification: NotificationItem = {
      ...order,
      id: notificationId,
      isVisible: true,
    };

    // Agregar notificación a la lista
    this.notifications.update(notifications => [...notifications, notification]);

    // Reproducir sonido
    if (this.soundEnabled()) {
      this.audioService.playAlert('order');
    }

    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
      this.hideNotification(notificationId);
    }, 10000);
  }

  hideNotification(id: string): void {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === id ? { ...n, isVisible: false } : n
      )
    );

    // Remover completamente después de la animación
    setTimeout(() => {
      this.notifications.update(notifications =>
        notifications.filter(n => n.id !== id)
      );
    }, 300);
  }

  dismissNotification(id: string): void {
    this.hideNotification(id);
  }

  toggleSound(): void {
    const newState = !this.soundEnabled();
    this.soundEnabled.set(newState);
    this.audioService.setEnabled(newState);

    // Reproducir un sonido de confirmación
    if (newState) {
      this.audioService.playAlert('success');
    }
  }

  viewOrder(orderId: string): void {
    // Navegar a la vista de la orden
    // this.router.navigate(['/orders', orderId]);
    console.log('Ver orden:', orderId);
  }

  // Método para testing (puedes eliminarlo en producción)
  testNotification(): void {
    const testOrder: OrderAssignedEvent = {
      order_id: '12345',
      motorcycle_id: 'moto-001',
      driver_name: 'Juan Pérez',
      customer_name: 'María García',
      restaurant: 'Restaurante Demo',
      total: 45000,
      timestamp: new Date(),
    };
    this.showNotification(testOrder);
  }
}