import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIAssistantApi, ChatMessage, ChatConversation } from '../../api/ai-assistant.api';
import { AccountsApi } from '../../api/accounts.api';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody', { static: false }) chatBody!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  aiApi = inject(AIAssistantApi);
  accountsApi = inject(AccountsApi);
  isOpen = signal(false);
  currentMessage = '';

  private shouldScrollToBottom = false;

  ngOnInit() {
    // Initialize financial context (you can expand this based on current page/data)
    this.updateFinancialContext();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isOpen.update(value => !value);
    if (this.isOpen()) {
      this.updateFinancialContext();
      setTimeout(() => this.focusInput(), 100);
    }
  }

  currentMessages(): ChatMessage[] {
    const conversation = this.aiApi.currentConversation();
    return conversation ? conversation.messages : [];
  }

  sendMessage() {
    if (!this.canSendMessage()) return;

    const message = this.currentMessage.trim();
    this.currentMessage = '';
    this.shouldScrollToBottom = true;

    this.aiApi.sendMessage(message).subscribe({
      next: (response) => {
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  sendSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  canSendMessage(): boolean {
    return this.currentMessage.trim().length > 0 && !this.aiApi.isTyping();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  startNewConversation() {
    this.aiApi.createNewConversation();
    this.shouldScrollToBottom = true;
  }

  hasUnreadMessages(): boolean {
    // Simple logic - you can enhance this with proper unread tracking
    const conversation = this.aiApi.currentConversation();
    return conversation ? conversation.messages.length > 1 : false;
  }

  formatMessage(content: string): string {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• ');
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return timestamp.toLocaleDateString();
  }

  // Template helper methods
  hasSuggestions(message: ChatMessage): boolean {
    return !!(message.metadata?.suggestions && message.metadata.suggestions.length > 0);
  }

  getSuggestions(message: ChatMessage): string[] {
    return message.metadata?.suggestions || [];
  }

  private scrollToBottom() {
    if (this.chatBody) {
      const element = this.chatBody.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private focusInput() {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  private updateFinancialContext() {
    // Update context based on current page and available data
    const currentPage = this.getCurrentPage();
    const accounts = this.accountsApi.accounts() || [];

    // Calculate financial metrics
    const totalBalance = accounts.reduce((sum, account) => sum + (account.balanceCents || 0), 0) / 100;
    const accountsCount = accounts.length;

    this.aiApi.updateFinancialContext({
      currentPage,
      accountsCount,
      totalBalance,
      // Add more context as available
    });
  }

  private getCurrentPage(): string {
    // Simple page detection - you can enhance this
    const path = window.location.pathname;
    if (path.includes('accounts')) return 'accounts';
    if (path.includes('transactions')) return 'transactions';
    if (path.includes('budget')) return 'budget';
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('dashboard')) return 'dashboard';
    return 'unknown';
  }
}
