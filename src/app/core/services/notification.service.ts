import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { OrderNotification, Notification } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<OrderNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private notifications = signal<Notification[]>([]);
  private audioContext: AudioContext | null = null;

  readonly currentNotifications = this.notifications.asReadonly();

  show(notification: Omit<Notification, 'id'>): void {
    const id = Date.now().toString();
    const newNotification: Notification = { ...notification, id };

    this.notifications.update((current) => [...current, newNotification]);

    if (notification.type === 'order') {
      this.playOrderSound();
    }

    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.notifications.update((current) => current.filter((n) => n.id !== id));
  }

  private playOrderSound(): void {
    try {
      if (typeof window === 'undefined') return;

      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.5,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      setTimeout(() => {
        if (!this.audioContext) return;
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.5,
        );
        osc2.start(this.audioContext.currentTime);
        osc2.stop(this.audioContext.currentTime + 0.5);
      }, 200);
    } catch (error) {}
  }

  success(message: string, title = 'Éxito'): void {
    this.show({ type: 'success', title, message });
  }

  error(message: string, title = 'Error'): void {
    this.show({ type: 'error', title, message, duration: 8000 });
  }

  warning(message: string, title = 'Advertencia'): void {
    this.show({ type: 'warning', title, message });
  }

  info(message: string, title = 'Información'): void {
    this.show({ type: 'info', title, message });
  }

  newOrder(orderId: string | number, restaurantName: string): void {
    this.show({
      type: 'order',
      title: '¡Nuevo Pedido!',
      message: `Pedido #${orderId} de ${restaurantName}`,
      duration: 10000,
    });
  }

  addNotification(notification: OrderNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);

    if (!notification.read) {
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    );
    this.notificationsSubject.next(notifications);

    const unreadCount = notifications.filter((n) => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map((n) => ({
      ...n,
      read: true,
    }));
    this.notificationsSubject.next(notifications);
    this.unreadCountSubject.next(0);
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}
