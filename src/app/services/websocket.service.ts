import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { 
  CollaborativeEvent, 
  Collaborator, 
  CollaborationSession 
} from './collaboration.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = environment.websocketUrl;
  
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private eventSubject = new Subject<CollaborativeEvent>();
  
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public events$ = this.eventSubject.asObservable();

  constructor() {}

  connect(userId: string, userName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Connecting to ${this.serverUrl} as ${userName} (${userId})`);
        
        this.socket = io(this.serverUrl, {
          auth: {
            userId,
            userName
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          console.log(`✅ Connected to collaboration server - Socket ID: ${this.socket?.id}`);
          this.connectionStatusSubject.next(true);
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`❌ Disconnected from collaboration server - Reason: ${reason}`);
          this.connectionStatusSubject.next(false);
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('❌ Connection error:', error);
          this.connectionStatusSubject.next(false);
          reject(error);
        });

        // Listen for collaborative events
        this.socket.on('collaborative-event', (event: CollaborativeEvent) => {
          console.log(`📡 Received collaborative event from ${event.userId}:`, event.type, event.data);
          this.eventSubject.next(event);
        });

        this.socket.on('session-updated', (session: CollaborationSession) => {
          this.eventSubject.next({
            type: 'session-updated' as any,
            data: session,
            timestamp: Date.now(),
            userId: '',
            sessionId: session.id
          });
        });

        // Listen for initial state when joining a session
        this.socket.on('initial-state', (state: {[key: string]: any}) => {
          console.log('📦 Received initial session state:', state);
          this.eventSubject.next({
            type: 'initial-state' as any,
            data: state,
            timestamp: Date.now(),
            userId: '',
            sessionId: ''
          });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      console.log(`📤 Emitting ${event}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot emit event:', event, {
        hasSocket: !!this.socket,
        isConnected: this.socket?.connected
      });
    }
  }

  joinSession(sessionId: string): void {
    console.log(`🔗 Joining session: ${sessionId}`);
    this.emit('join-session', { sessionId });
  }

  leaveSession(sessionId: string): void {
    this.emit('leave-session', { sessionId });
  }

  createSession(): void {
    console.log('🆕 Creating new session');
    this.emit('create-session', {});
  }

  sendCollaborativeEvent(event: CollaborativeEvent): void {
    console.log(`📤 Sending collaborative event:`, event.type, event.data);
    this.emit('collaborative-event', event);
  }

  requestControl(sessionId: string): void {
    this.emit('request-control', { sessionId });
  }

  releaseControl(sessionId: string): void {
    this.emit('release-control', { sessionId });
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }
}