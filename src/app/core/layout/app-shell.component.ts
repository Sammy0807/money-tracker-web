import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar.component';
import { SidebarComponent } from './sidebar.component';
import { ChatWidgetComponent } from './chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent, ChatWidgetComponent],
  template: `
  <div class="shell">
    <app-topbar/>
    <div class="main">
      <app-sidebar/>
      <main class="content">
        <router-outlet/>
      </main>
    </div>
    <app-chat-widget/>
  </div>
  `,
  styles: [`
    .shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-secondary);
    }

    .main {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-xl);
      background: var(--bg-secondary);
      position: relative;
    }

    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-light), transparent);
    }

    /* Page container styles for consistent animations */
    :host ::ng-deep router-outlet + * {
      animation: fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-fill-mode: both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .main {
        flex-direction: column;
      }

      .content {
        padding: var(--space-md);
      }
    }

    /* Custom scrollbar for content area */
    .content::-webkit-scrollbar {
      width: 8px;
    }

    .content::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: 4px;
    }

    .content::-webkit-scrollbar-thumb {
      background: var(--border-medium);
      border-radius: 4px;
      transition: background var(--transition-base);
    }

    .content::-webkit-scrollbar-thumb:hover {
      background: var(--gray-400);
    }
  `]
})
export class AppShellComponent {}
