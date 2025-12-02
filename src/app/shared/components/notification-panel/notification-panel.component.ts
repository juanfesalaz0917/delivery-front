import { Component, type OnInit, inject, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NotificationService } from "../../../core/services/notification.service"
import type { OrderNotification } from "../../../core/models"

@Component({
  selector: "app-notification-panel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./notification-panel.component.html",
  styleUrls: ["./notification-panel.component.css"],
})
export class NotificationPanelComponent implements OnInit {
  private notificationService = inject(NotificationService)

  notifications = signal<OrderNotification[]>([])
  unreadCount = signal(0)
  showPanel = signal(false)

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications.set(notifications)
    })

    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount.set(count)
    })
  }

  togglePanel(): void {
    this.showPanel.set(!this.showPanel())
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId)
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
  }

  clearAll(): void {
    this.notificationService.clearNotifications()
    this.showPanel.set(false)
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ahora mismo"
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours} h`
    return `Hace ${days} días`
  }
}
