import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CollaborationService } from '../../services/collaboration.service';
import { CursorService } from '../../services/cursor.service';
import { StateSyncService } from '../../services/state-sync.service';
import { Collaborator, CollaborationSession, NavigationEvent } from '../../services/collaboration.types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>🔗 SyncUI Collaborative Editor</h1>
        <p class="subtitle">Real-time collaboration with shared cursors, synchronized forms, and live updates</p>
        
        <!-- Connection Status -->
        <div class="connection-status" [ngClass]="{'connected': connectionStatus, 'disconnected': !connectionStatus}">
          <span class="status-indicator"></span>
          <span class="status-text">{{ connectionStatusText }}</span>
        </div>
        
        <div class="demo-mode">
          <h2>🚀 Real-time Collaboration</h2>
          <p>Experience real-time collaboration in action!</p>
          
          <div class="user-info" *ngIf="currentUser">
            <div class="user-badge" [style.background-color]="currentUser.color">
              {{ currentUser.name }}
            </div>
          </div>
          
          <div class="action-buttons">
            <button 
              class="btn btn-primary" 
              (click)="startCollaborativeSession()"
              [disabled]="!isConnected"
            >
              👥 Start New Session
            </button>
            
            <div class="join-section">
              <input 
                type="text" 
                placeholder="Enter session ID to join..."
                class="session-input"
                #sessionInput
                [disabled]="!isConnected"
              >
              <button 
                class="btn btn-secondary" 
                (click)="joinSession(sessionInput.value)"
                [disabled]="!isConnected || !sessionInput.value"
              >
                🔗 Join Session
              </button>
            </div>
          </div>
          
          <!-- Current Session Info -->
          <div class="session-info" *ngIf="currentSession">
            <h3>Current Session: {{ currentSession.id }}</h3>
            <div class="participants">
              <div 
                class="participant" 
                *ngFor="let participant of collaborators"
                [style.border-color]="participant.color"
              >
                <span class="participant-name">{{ participant.name }}</span>
                <span class="participant-role" *ngIf="participant.isOwner">👑</span>
                <span class="participant-control" *ngIf="participant.hasControl">🎮</span>
              </div>
            </div>
            
            <div class="session-actions">
              <button class="btn btn-success" (click)="goToEditor()">
                🚀 Go to Collaborative Editor
              </button>
              <button class="btn btn-danger" (click)="leaveSession()">
                👋 Leave Session
              </button>
            </div>
          </div>
        </div>
        
        <div class="features">
          <h3>✨ Features</h3>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">�</div>
              <h4>Real-time Cursors</h4>
              <p>See collaborators' cursors move in real-time</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h4>Form Synchronization</h4>
              <p>Synchronized form inputs and selections</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <h4>Live Updates</h4>
              <p>Instant UI updates across all participants</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h4>Multi-user Support</h4>
              <p>Collaborate with multiple users simultaneously</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Collaborative Cursors Display -->
      <div class="collaborative-cursors">
        <div 
          class="cursor" 
          *ngFor="let cursor of collaborativeCursors"
          [style.left.px]="cursor.x"
          [style.top.px]="cursor.y"
        >
          <div class="cursor-pointer"></div>
          <div class="cursor-label">{{ cursor.userName }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .hero-section h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #7f8c8d;
      max-width: 600px;
      margin: 0 auto 2rem;
    }

    .connection-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
    }

    .connection-status.true {
      background: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .connection-status.false {
      background: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
    }

    .connection-status.true .status-indicator {
      background: #28a745;
    }

    .connection-status.false .status-indicator {
      background: #dc3545;
    }

    .demo-mode {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .demo-mode h2 {
      margin-top: 0;
      color: #2c3e50;
    }

    .user-info {
      margin-bottom: 1.5rem;
    }

    .user-badge {
      display: inline-block;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .join-section {
      display: flex;
      gap: 0.5rem;
    }

    .session-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .session-info {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .session-info h3 {
      margin-top: 0;
      color: #004085;
    }

    .participants {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .session-actions {
      display: flex;
      gap: 1rem;
    }

    .features h3 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 2rem;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #ecf0f1;
      text-align: center;
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .feature-card h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .feature-card p {
      color: #7f8c8d;
      margin: 0;
    }

    .collaborative-cursors {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 10000;
    }

    .cursor {
      position: absolute;
      transform: translate(-2px, -2px);
      transition: all 0.1s ease-out;
    }

    .cursor-pointer {
      width: 12px;
      height: 12px;
      background: #3498db;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .cursor-label {
      position: absolute;
      top: 15px;
      left: 5px;
      background: #3498db;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    @media (max-width: 768px) {
      .action-buttons {
        align-items: stretch;
      }
      
      .join-section {
        flex-direction: column;
      }
      
      .session-actions {
        flex-direction: column;
      }
      
      .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: Collaborator | null = null;
  currentSession: CollaborationSession | null = null;
  collaborators: Collaborator[] = [];
  collaborativeCursors: any[] = [];
  connectionStatus: boolean = false;
  connectionStatusText: string = 'Connecting...';
  isConnected: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private collaborationService: CollaborationService,
    private cursorService: CursorService,
    private stateSyncService: StateSyncService
  ) {}

  async ngOnInit() {
    console.log('🏠 Home component loaded - initializing collaboration');
    console.log('🔍 Browser:', navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edge') ? 'Edge' : 'Other');
    await this.initializeCollaboration();
  }

  ngOnDestroy() {
    console.log('🗑️ Home component destroying - preserving connection');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Don't disconnect when navigating to editor - preserve session
    // this.collaborationService.disconnect();
  }

  private async initializeCollaboration() {
    try {
      await this.collaborationService.initialize();
      
      // Subscribe to connection status
      this.subscriptions.push(
        this.collaborationService.connectionStatus$.subscribe(status => {
          this.connectionStatus = status;
          this.isConnected = status;
          
          if (status) {
            this.connectionStatusText = '✅ Connected';
          } else {
            this.connectionStatusText = '❌ Disconnected';
          }
        })
      );

      // Subscribe to session updates
      this.subscriptions.push(
        this.collaborationService.session$.subscribe(session => {
          this.currentSession = session;
        })
      );

      // Subscribe to collaborators
      this.subscriptions.push(
        this.collaborationService.collaborators$.subscribe(collaborators => {
          this.collaborators = collaborators;
        })
      );

    // Subscribe to collaborative cursors
    this.subscriptions.push(
      this.cursorService.collaborativeCursors$.subscribe(cursors => {
        this.collaborativeCursors = cursors;
      })
    );

    // Subscribe to navigation events
    this.subscriptions.push(
      this.collaborationService.getCollaborativeEvents().subscribe((event: any) => {
        console.log('📡 Received event:', event.type, 'from', event.userId);
        
        if (event.type === 'navigation' && event.userId !== this.currentUser?.id) {
          const navData = event.data;
          console.log('🧭 Collaborative navigation to:', navData.route, 'from user:', event.userId);
          
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            this.router.navigate([navData.route], navData.params || {});
          }, 100);
        }
      })
    );

    this.currentUser = this.collaborationService.getCurrentUser();      console.log('✅ Collaboration initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize collaboration:', error);
      this.connectionStatusText = '⚠️ Failed to connect to server';
    }
  }

  startCollaborativeSession() {
    if (!this.isConnected) return;
    
    console.log('🚀 Starting new collaborative session');
    this.collaborationService.createSession();
  }

  joinSession(sessionId: string) {
    if (!this.isConnected || !sessionId.trim()) return;
    
    console.log('🔗 Joining session:', sessionId);
    this.collaborationService.joinSession(sessionId.trim());
  }

  leaveSession() {
    console.log('👋 Leaving current session');
    this.collaborationService.leaveSession();
  }

  goToEditor() {
    console.log('🚀 Navigating to editor...');
    console.log('🔍 Session check:', {
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id,
      isConnected: this.isConnected,
      participantCount: this.collaborators.length
    });
    
    // Sync navigation if in a collaborative session BEFORE navigating
    if (this.currentSession && this.isConnected) {
      console.log('🧭 Sending navigation sync to other participants');
      this.collaborationService.sendNavigation('/editor');
    } else {
      console.log('⚠️ Not syncing navigation - no active session or not connected');
    }
    
    // Navigate after sending the sync event
    this.router.navigate(['/editor']);
  }
}