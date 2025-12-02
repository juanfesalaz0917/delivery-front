import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NotificationPanelComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() sidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  isMobile = signal(false);
  user$ = this.authService.currentUser$;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth < 1024);
      window.addEventListener('resize', () => {
        this.isMobile.set(window.innerWidth < 1024);
      });
    }
  }
}
