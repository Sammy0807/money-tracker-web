import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, ChatWidgetComponent],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent {

  private authService = inject(AuthService);
  constructor() {
    this.authService.login({ username: 'alice', password: 'Passw0rd!' }).subscribe({
      next: (response) => {
        console.log('Login successful:');
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

}
