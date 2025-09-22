import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <nav class="sidebar">
    <div class="nav-section">
      <h3 class="section-title">Overview</h3>
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-text">Dashboard</span>
      </a>
      <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">📈</span>
        <span class="nav-text">Analytics</span>
      </a>
    </div>

    <div class="nav-section">
      <h3 class="section-title">Finance</h3>
      <a routerLink="/accounts" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">🏦</span>
        <span class="nav-text">Accounts</span>
      </a>
      <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">💳</span>
        <span class="nav-text">Transactions</span>
      </a>
      <a routerLink="/budget" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">💰</span>
        <span class="nav-text">Budget</span>
      </a>
    </div>

    <div class="nav-section">
      <h3 class="section-title">Tools</h3>
      <a routerLink="/rules" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Rules</span>
      </a>
      <a routerLink="/import" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">📥</span>
        <span class="nav-text">Import</span>
      </a>
      <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">🔔</span>
        <span class="nav-text">Notifications</span>
      </a>
    </div>

    <div class="nav-section">
      <h3 class="section-title">Account</h3>
      <a routerLink="/profile" routerLinkActive="active" class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-text">Profile</span>
      </a>
    </div>
  </nav>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      background: #f8f9fc;
      border-right: 1px solid #e3e6f0;
      display: flex;
      flex-direction: column;
      padding: 2rem 0;
      gap: 2rem;
      height: 100%;
      overflow-y: auto;
    }

    .nav-section {
      padding: 0 1.5rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #6c757d;
      margin: 0 0 1rem 0;
      padding: 0 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-bottom: 0.25rem;
      text-decoration: none;
      color: #5a5c69;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }

    .nav-item:hover {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
      transform: translateX(4px);
    }

    .nav-item:hover::before {
      transform: scaleY(1);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .nav-item.active::before {
      transform: scaleY(1);
      background: rgba(255, 255, 255, 0.3);
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      transition: transform 0.2s ease;
    }

    .nav-item:hover .nav-icon {
      transform: scale(1.1);
    }

    .nav-text {
      font-size: 0.875rem;
      transition: color 0.2s ease;
    }

    /* Scrollbar styling */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: #d1d3e2;
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #858796;
    }
  `]
})
export class SidebarComponent {}
