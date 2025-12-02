import { Component, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChatbotService,
  ChatMessage,
} from '../../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit {
  private readonly chatbotService = inject(ChatbotService);
  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  frequentQuestions: { question: string; answer: string }[] = [];

  ngOnInit(): void {
    this.frequentQuestions = this.chatbotService.getFrequentQuestions();
    this.addAssistantMessage(
      'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    );
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage = this.newMessage.trim();
    this.addUserMessage(userMessage);
    this.newMessage = '';
    this.isLoading = true;

    this.chatbotService.sendMessage(userMessage).then((response) => {
      this.addAssistantMessage(response);
      this.isLoading = false;
    });
  }

  selectFrequentQuestion(question: { question: string; answer: string }): void {
    this.addUserMessage(question.question);
    setTimeout(() => {
      this.addAssistantMessage(question.answer);
    }, 500);
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      id: this.generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    });
    this.scrollToBottom();
  }

  private addAssistantMessage(content: string): void {
    this.messages.push({
      id: this.generateId(),
      content,
      role: 'assistant',
      timestamp: new Date(),
    });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
