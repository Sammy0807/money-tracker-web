import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Chat Models
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: FinancialContext;
}

export interface FinancialContext {
  currentPage?: string;
  accountsCount?: number;
  totalBalance?: number;
  recentTransactions?: any[];
  currentFilters?: any;
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
}

@Injectable({ providedIn: 'root' })
export class AIAssistantApi {
  private http = inject(HttpClient);

  // State management
  conversations = signal<ChatConversation[]>([]);
  currentConversation = signal<ChatConversation | null>(null);
  isTyping = signal(false);
  isConnected = signal(true);

  // Current financial context
  private financialContext = signal<FinancialContext>({});

  constructor() {
    // Initialize with a default conversation
    this.createNewConversation();
  }

  // Conversation Management
  createNewConversation(): ChatConversation {
    const conversation: ChatConversation = {
      id: this.generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context: this.financialContext()
    };

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content: "👋 Hi! I'm Ezra, your AI finance assistant. I can help you with budgeting, analyzing spending patterns, setting financial goals, and answering questions about your finances. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
      metadata: {
        suggestions: [
          "What's my spending pattern this month?",
          "Help me create a budget",
          "Show me my account balances",
          "Analyze my transactions"
        ]
      }
    };

    conversation.messages.push(welcomeMessage);

    this.conversations.update(convs => [conversation, ...convs]);
    this.currentConversation.set(conversation);

    return conversation;
  }

  // Send message and get AI response
  sendMessage(content: string): Observable<ChatResponse> {
    const conversation = this.currentConversation();
    if (!conversation) {
      return of({ message: this.createErrorMessage('No active conversation') });
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    this.addMessageToConversation(userMessage);

    // Show typing indicator
    this.isTyping.set(true);

    // Simulate API call (replace with actual API when ready)
    return this.simulateAIResponse(content, conversation).pipe(
      map(response => {
        this.isTyping.set(false);
        this.addMessageToConversation(response.message);
        return response;
      })
    );
  }

  // Update financial context
  updateFinancialContext(context: Partial<FinancialContext>) {
    this.financialContext.update(current => ({ ...current, ...context }));

    const conversation = this.currentConversation();
    if (conversation) {
      conversation.context = { ...conversation.context, ...context };
      this.updateConversation(conversation);
    }
  }

  // Get conversation history
  getConversations(): ChatConversation[] {
    return this.conversations();
  }

  // Switch to a different conversation
  switchConversation(conversationId: string) {
    const conversation = this.conversations().find(c => c.id === conversationId);
    if (conversation) {
      this.currentConversation.set(conversation);
    }
  }

  // Delete conversation
  deleteConversation(conversationId: string) {
    this.conversations.update(convs => convs.filter(c => c.id !== conversationId));

    if (this.currentConversation()?.id === conversationId) {
      const remaining = this.conversations();
      if (remaining.length > 0) {
        this.currentConversation.set(remaining[0]);
      } else {
        this.createNewConversation();
      }
    }
  }

  // Clear all conversations
  clearAllConversations() {
    this.conversations.set([]);
    this.createNewConversation();
  }

  // Private helper methods
  private addMessageToConversation(message: ChatMessage) {
    const conversation = this.currentConversation();
    if (!conversation) return;

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    // Update title based on first user message
    if (message.role === 'user' && conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = this.generateConversationTitle(message.content);
    }

    this.updateConversation(conversation);
  }

  private updateConversation(conversation: ChatConversation) {
    this.conversations.update(convs =>
      convs.map(c => c.id === conversation.id ? conversation : c)
    );

    if (this.currentConversation()?.id === conversation.id) {
      this.currentConversation.set(conversation);
    }
  }

  private generateConversationTitle(content: string): string {
    const trimmed = content.substring(0, 30);
    return trimmed.length < content.length ? trimmed + '...' : trimmed;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createErrorMessage(error: string): ChatMessage {
    return {
      id: this.generateId(),
      content: `❌ Sorry, I encountered an error: ${error}`,
      role: 'assistant',
      timestamp: new Date()
    };
  }

  // Simulate AI response (replace with actual API call)
  private simulateAIResponse(userMessage: string, conversation: ChatConversation): Observable<ChatResponse> {
    const context = this.financialContext();

    return of(this.generateMockResponse(userMessage, context)).pipe(
      delay(1000 + Math.random() * 2000) // Simulate network delay
    );
  }

  private generateMockResponse(userMessage: string, context: FinancialContext): ChatResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Financial keyword-based responses
    if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
      return {
        message: {
          id: this.generateId(),
          content: `💰 I'd be happy to help you with budgeting! Based on your current accounts${context.accountsCount ? ` (${context.accountsCount} accounts)` : ''}, here are some budgeting strategies:\n\n• **50/30/20 Rule**: 50% needs, 30% wants, 20% savings\n• **Zero-based budgeting**: Every dollar has a purpose\n• **Envelope method**: Allocate specific amounts to categories\n\nWould you like me to analyze your spending patterns to suggest a personalized budget?`,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            confidence: 0.95,
            suggestions: [
              "Analyze my spending patterns",
              "Create a monthly budget plan",
              "Show me my largest expenses"
            ]
          }
        }
      };
    }

    if (lowerMessage.includes('spending') || lowerMessage.includes('expenses')) {
      return {
        message: {
          id: this.generateId(),
          content: `📊 Let me help you analyze your spending! Here's what I can do:\n\n• **Category Analysis**: Break down spending by category\n• **Trend Analysis**: Show spending patterns over time\n• **Unusual Spending**: Identify outliers and large expenses\n• **Comparison**: Compare this month vs previous months\n\nWhich type of spending analysis would be most helpful for you?`,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            suggestions: [
              "Show spending by category",
              "Compare this month to last month",
              "Find my largest expenses"
            ]
          }
        }
      };
    }

    if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
      return {
        message: {
          id: this.generateId(),
          content: `🏦 I can help you with account information! ${context.totalBalance ? `Your current total balance across all accounts is $${context.totalBalance.toLocaleString()}.` : ''}\n\nHere's what I can show you:\n\n• **Account Overview**: All account balances and types\n• **Net Worth**: Assets minus liabilities\n• **Account Performance**: Growth over time\n• **Alerts**: Low balances or unusual activity\n\nWhat specific account information would you like to see?`,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            suggestions: [
              "Show all account balances",
              "Calculate my net worth",
              "Check for low balances"
            ]
          }
        }
      };
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('save')) {
      return {
        message: {
          id: this.generateId(),
          content: `🎯 Great question about financial goals! Setting and tracking goals is crucial for financial success. I can help you:\n\n• **Set SMART Goals**: Specific, measurable, achievable goals\n• **Create Savings Plans**: Monthly amounts needed to reach goals\n• **Track Progress**: Monitor how you're doing against targets\n• **Adjust Plans**: Modify goals based on your situation\n\nWhat financial goal would you like to work on? (Emergency fund, vacation, house down payment, retirement, etc.)`,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            suggestions: [
              "Help me save for an emergency fund",
              "Plan for a house down payment",
              "Set up retirement savings"
            ]
          }
        }
      };
    }

    // Default response
    return {
      message: {
        id: this.generateId(),
        content: `🤖 I understand you're asking about "${userMessage}". As your AI finance assistant, I'm here to help with:\n\n• **Budgeting & Planning**: Create and manage budgets\n• **Spending Analysis**: Understand your spending patterns\n• **Goal Setting**: Plan for financial milestones\n• **Account Management**: Monitor balances and transactions\n• **Financial Insights**: Get personalized recommendations\n\nCould you be more specific about what you'd like help with? I'm constantly learning to better assist you!`,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          confidence: 0.7,
          suggestions: [
            "Help me create a budget",
            "Analyze my spending this month",
            "Show my account balances",
            "Set a savings goal"
          ]
        }
      }
    };
  }

  // Method to integrate with real API (implement when your API is ready)
  private callRealAPI(message: string, context: FinancialContext): Observable<ChatResponse> {
    // This will be implemented when your API is ready
    return this.http.post<ChatResponse>(`${environment.apiBase}/ai/chat`, {
      message,
      context,
      conversationId: this.currentConversation()?.id
    });
  }
}
