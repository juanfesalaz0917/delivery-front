import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { ChatbotComponent } from '../shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SidebarComponent, ChatbotComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  @Input() showSidebar: boolean = true;

  private readonly authService = inject(AuthService);
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout() {
    this.authService.logout();
  }
}
