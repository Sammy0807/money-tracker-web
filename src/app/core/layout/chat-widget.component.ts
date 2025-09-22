import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="chat-widget">
      <!-- Chat Panel -->
      <div class="chat-panel" [class.show]="isOpen()">
        <div class="chat-header">
          <div class="assistant-info">
            <div class="assistant-avatar">
              <span class="avatar-icon">🤖</span>
            </div>
            <div class="assistant-details">
              <h3 class="assistant-name">Ezra</h3>
              <p class="assistant-status">AI Finance Assistant</p>
            </div>
          </div>
          <button class="close-btn" (click)="toggleChat()" aria-label="Close chat">
            <span>✕</span>
          </button>
        </div>

        <div class="chat-body">
          <div class="welcome-message">
            <div class="message-bubble assistant">
              <p>👋 Hi! I'm Ezra, your AI finance assistant.</p>
              <p>I'm here to help you with:</p>
              <ul>
                <li>💰 Budget planning and analysis</li>
                <li>📊 Financial insights and trends</li>
                <li>💳 Transaction categorization</li>
                <li>🎯 Goal setting and tracking</li>
              </ul>
              <p class="coming-soon">🚧 Full functionality coming soon!</p>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <div class="input-area">
            <input
              type="text"
              placeholder="Ask Ezra anything about your finances..."
              class="chat-input"
              disabled
            />
            <button class="send-btn" disabled>
              <span>📤</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Toggle Button -->
      <button
        class="chat-toggle"
        [class.active]="isOpen()"
        (click)="toggleChat()"
        aria-label="Open AI assistant chat"
      >
        <span class="toggle-icon" *ngIf="!isOpen()">💬</span>
        <span class="toggle-icon close" *ngIf="isOpen()">✕</span>
        <div class="notification-dot" *ngIf="!isOpen()"></div>
      </button>
    </div>
  `,
  styles: [`
    .chat-widget {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      font-family: inherit;
    }

    .chat-toggle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .chat-toggle::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      transform: scale(0);
      transition: transform 0.3s ease;
    }

    .chat-toggle:hover::before {
      transform: scale(1);
    }

    .chat-toggle:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }

    .chat-toggle.active {
      transform: rotate(180deg);
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .toggle-icon {
      transition: all 0.3s ease;
      display: block;
    }

    .toggle-icon.close {
      font-size: 1.25rem;
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }

    .chat-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(20px) scale(0.9);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chat-panel.show {
      transform: translateY(0) scale(1);
      opacity: 1;
      visibility: visible;
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .assistant-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .assistant-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      backdrop-filter: blur(10px);
    }

    .assistant-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .assistant-status {
      margin: 0;
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      font-size: 1rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .chat-body {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      background: var(--bg-secondary);
    }

    .welcome-message {
      animation: fadeInUp 0.5s ease 0.2s both;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-bubble {
      background: white;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border-light);
    }

    .message-bubble.assistant {
      border-left: 4px solid var(--primary-500);
    }

    .message-bubble p {
      margin: 0 0 0.75rem 0;
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .message-bubble p:last-child {
      margin-bottom: 0;
    }

    .message-bubble ul {
      margin: 0.5rem 0;
      padding-left: 1.25rem;
    }

    .message-bubble li {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .coming-soon {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
      font-size: 0.875rem !important;
    }

    .chat-footer {
      padding: 1rem;
      background: white;
      border-top: 1px solid var(--border-light);
    }

    .input-area {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .chat-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-medium);
      border-radius: 24px;
      font-size: 0.875rem;
      background: var(--bg-secondary);
      transition: all 0.2s ease;
      resize: none;
      outline: none;
    }

    .chat-input:focus {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .chat-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-gradient);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 1rem;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .send-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .chat-widget {
        bottom: 1rem;
        right: 1rem;
      }

      .chat-panel {
        width: calc(100vw - 2rem);
        right: -1rem;
        height: 80vh;
        max-height: 500px;
      }

      .chat-toggle {
        width: 56px;
        height: 56px;
        font-size: 1.25rem;
      }
    }

    /* Scrollbar styling for chat body */
    .chat-body::-webkit-scrollbar {
      width: 6px;
    }

    .chat-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-body::-webkit-scrollbar-thumb {
      background: var(--border-medium);
      border-radius: 3px;
    }

    .chat-body::-webkit-scrollbar-thumb:hover {
      background: var(--gray-400);
    }
  `]
})
export class ChatWidgetComponent {
  isOpen = signal(false);

  toggleChat() {
    this.isOpen.update(value => !value);
  }
}
