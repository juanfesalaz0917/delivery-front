import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { environment } from '../../environment';



export interface OrderAssignedEvent {
  order_id: string;
  motorcycle_id: string;
  driver_name: string;
  customer_name: string;
  restaurant: string;
  total: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: SocketIOClient.Socket | null = null;
  private orderAssignedSubject = new Subject<OrderAssignedEvent>();
  
  // Observable para que los componentes se suscriban
  public orderAssigned$ = this.orderAssignedSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    // Configura la URL del servidor WebSocket independiente
    const socketUrl = environment.socketUrl || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Error de conexión WebSocket:', error);
    });

    // Escuchar evento de orden asignada
    this.socket.on('order_assigned', (data: OrderAssignedEvent) => {
      console.log('🔔 Nueva orden asignada:', data);
      this.orderAssignedSubject.next(data);
    });
  }

  // Método para unirse a una sala específica (ej: sala de motociclistas)
  public joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('join_room', room);
      console.log(`📍 Unido a la sala: ${room}`);
    }
  }

  // Método para salir de una sala
  public leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', room);
      console.log(`🚪 Salió de la sala: ${room}`);
    }
  }

  // Desconectar socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Reconectar socket
  public reconnect(): void {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
  }
}