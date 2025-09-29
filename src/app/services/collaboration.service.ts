import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';
import { 
  CollaborativeEvent, 
  Collaborator, 
  CollaborationSession,
  NavigationEvent 
} from './collaboration.types';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private currentUser: Collaborator | null = null;
  private currentSession: CollaborationSession | null = null;
  
  private collaboratorsSubject = new BehaviorSubject<Collaborator[]>([]);
  private sessionSubject = new BehaviorSubject<CollaborationSession | null>(null);
  private hasControlSubject = new BehaviorSubject<boolean>(false);
  
  public collaborators$ = this.collaboratorsSubject.asObservable();
  public session$ = this.sessionSubject.asObservable();
  public hasControl$ = this.hasControlSubject.asObservable();
  public connectionStatus$ = this.webSocketService.connectionStatus$;

  constructor(private webSocketService: WebSocketService) {
    // Listen for session updates
    this.webSocketService.events$.pipe(
      filter((event: any) => event.type === 'session-updated' as any)
    ).subscribe((event: any) => {
      this.currentSession = event.data;
      this.sessionSubject.next(this.currentSession);
      this.collaboratorsSubject.next(this.currentSession?.participants || []);
      
      // Update control status
      const userHasControl = this.currentSession?.participants.find(
        (p: any) => p.id === this.currentUser?.id
      )?.hasControl || false;
      this.hasControlSubject.next(userHasControl);
    });
  }

  async initialize(userId?: string, userName?: string): Promise<void> {
    const user = userId || this.generateUserId();
    const name = userName || this.generateUserName();
    
    try {
      await this.webSocketService.connect(user, name);
      
      this.currentUser = {
        id: user,
        name: name,
        color: this.generateUserColor(),
        isOwner: false,
        hasControl: false,
        joinedAt: new Date()
      };
      
      console.log('🤝 Collaboration service initialized for user:', this.currentUser);
    } catch (error) {
      console.error('❌ Failed to initialize collaboration service:', error);
      throw error;
    }
  }

  createSession(): void {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }
    
    this.webSocketService.createSession();
  }

  joinSession(sessionId: string): void {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }
    
    this.webSocketService.joinSession(sessionId);
  }

  leaveSession(): void {
    if (this.currentSession) {
      this.webSocketService.leaveSession(this.currentSession.id);
      this.currentSession = null;
      this.sessionSubject.next(null);
      this.collaboratorsSubject.next([]);
      this.hasControlSubject.next(false);
    }
  }

  requestControl(): void {
    if (this.currentSession) {
      this.webSocketService.requestControl(this.currentSession.id);
    }
  }

  releaseControl(): void {
    if (this.currentSession) {
      this.webSocketService.releaseControl(this.currentSession.id);
    }
  }

  sendEvent(event: Omit<CollaborativeEvent, 'userId' | 'sessionId' | 'timestamp'>): void {
    if (!this.currentUser || !this.currentSession) {
      return;
    }

    const fullEvent: CollaborativeEvent = {
      ...event,
      userId: this.currentUser.id,
      sessionId: this.currentSession.id,
      timestamp: Date.now()
    };

    this.webSocketService.sendCollaborativeEvent(fullEvent);
  }

  sendNavigation(route: string, params?: any): void {
    this.sendEvent({
      type: 'navigation',
      data: { route, params }
    });
  }

  getCollaborativeEvents(): Observable<CollaborativeEvent> {
    return this.webSocketService.events$.pipe(
      filter((event: any) => event.type !== 'session-updated' as any),
      map((event: any) => event as CollaborativeEvent)
    );
  }

  getCurrentUser(): Collaborator | null {
    return this.currentUser;
  }

  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  disconnect(): void {
    this.leaveSession();
    this.webSocketService.disconnect();
    this.currentUser = null;
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  private generateUserName(): string {
    const adjectives = ['Quick', 'Clever', 'Bright', 'Swift', 'Smart', 'Bold'];
    const nouns = ['Fox', 'Eagle', 'Lion', 'Tiger', 'Wolf', 'Bear'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
  }

  private generateUserColor(): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}