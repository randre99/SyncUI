import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CollaborationService } from '../../services/collaboration.service';
import { CursorService } from '../../services/cursor.service';
import { StateSyncService } from '../../services/state-sync.service';
import { Collaborator, CollaborationSession, NavigationEvent } from '../../services/collaboration.types';

@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container" #editorContainer>
      <div class="editor-header">
        <div class="header-left">
          <button class="btn btn-outline" (click)="goBack()">← Back to Home</button>
          <h1>🔗 Collaborative Editor</h1>
        </div>
        <div class="header-right">
          <div class="session-info" *ngIf="currentSession">
            <span class="session-id">Session: {{ currentSession.id }}</span>
            <span class="control-status" [ngClass]="{'has-control': hasControl}">
              {{ hasControl ? '🎮 In Control' : '👀 Viewing' }}
            </span>
          </div>
          <div class="connection-status" [ngClass]="{'connected': isConnected}">
            {{ isConnected ? '✅ Connected' : '❌ Disconnected' }}
          </div>
        </div>
      </div>

      <div class="collaborators-bar" *ngIf="collaborators.length > 0">
        <h4>👥 Collaborators ({{ collaborators.length }}):</h4>
        <div class="collaborator-list">
          <div 
            class="collaborator-badge" 
            *ngFor="let collaborator of collaborators"
            [style.background-color]="collaborator.color"
          >
            <span class="collaborator-name">{{ collaborator.name }}</span>
            <span class="collaborator-role" *ngIf="collaborator.isOwner">👑</span>
            <span class="collaborator-control" *ngIf="collaborator.hasControl">🎮</span>
          </div>
        </div>
        <div class="control-actions" *ngIf="currentSession && !hasControl">
          <button class="btn btn-sm btn-primary" (click)="requestControl()">
            🙋 Request Control
          </button>
        </div>
        <div class="control-actions" *ngIf="hasControl">
          <button class="btn btn-sm btn-secondary" (click)="releaseControl()">
            👋 Release Control
          </button>
        </div>
      </div>

      <div class="editor-content">
        <div class="demo-panels">
          <!-- Text Input Demo -->
          <div class="demo-panel">
            <h3>📝 Synchronized Form Inputs</h3>
            <p>Type in these fields - changes will sync across all connected users!</p>
            <div class="form-group">
              <label for="name-input">Name:</label>
              <input 
                id="name-input"
                name="name"
                type="text" 
                [(ngModel)]="demoForm.name"
                class="form-input"
                placeholder="Enter your name"
                [readonly]="!hasControl && !!currentSession">
            </div>
            <div class="form-group">
              <label for="email-input">Email:</label>
              <input 
                id="email-input"
                name="email"
                type="email" 
                [(ngModel)]="demoForm.email"
                class="form-input"
                placeholder="Enter your email"
                [readonly]="!hasControl && !!currentSession">
            </div>
            <div class="form-group">
              <label for="message-input">Message:</label>
              <textarea 
                id="message-input"
                name="message"
                [(ngModel)]="demoForm.message"
                class="form-textarea"
                rows="4"
                placeholder="Enter a message..."
                [readonly]="!hasControl && !!currentSession"></textarea>
            </div>
          </div>

          <!-- Interactive Elements Demo -->
          <div class="demo-panel">
            <h3>🖱️ Synchronized Interactive Elements</h3>
            <p>All interactions are synchronized across participants!</p>
            
            <div class="form-group">
              <label for="select-option">Select Option:</label>
              <select 
                id="select-option"
                name="selectedOption"
                [(ngModel)]="demoForm.selectedOption" 
                class="form-select"
                [disabled]="!hasControl && !!currentSession">
                <option value="">Choose...</option>
                <option value="option1">Collaboration Mode</option>
                <option value="option2">Real-time Sync</option>
                <option value="option3">Multi-user Support</option>
              </select>
            </div>

            <div class="form-group">
              <label>Synchronized Checkboxes:</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input 
                    id="checkbox1"
                    name="checkbox1"
                    type="checkbox" 
                    [(ngModel)]="demoForm.checkbox1"
                    [disabled]="!hasControl && !!currentSession">
                  Real-time Cursors
                </label>
                <label class="checkbox-label">
                  <input 
                    id="checkbox2"
                    name="checkbox2"
                    type="checkbox" 
                    [(ngModel)]="demoForm.checkbox2"
                    [disabled]="!hasControl && !!currentSession">
                  Form Synchronization
                </label>
              </div>
            </div>

            <div class="button-group">
              <button 
                id="primary-btn"
                class="btn btn-primary" 
                (click)="showAlert('Primary button clicked!')"
                [disabled]="!hasControl && !!currentSession">
                Synchronized Click
              </button>
              <button 
                id="secondary-btn"
                class="btn btn-secondary" 
                (click)="showAlert('Secondary button clicked!')"
                [disabled]="!hasControl && !!currentSession">
                Another Action
              </button>
              <button 
                id="add-content-btn"
                class="btn btn-success" 
                (click)="addDynamicContent()"
                [disabled]="!hasControl && !!currentSession">
                Add Dynamic Content
              </button>
            </div>
          </div>

          <!-- Dynamic Content Demo -->
          <div class="demo-panel">
            <h3>🔄 Dynamic Content Sync</h3>
            <p>Dynamic content additions are synchronized across all users:</p>
            
            <div class="dynamic-content">
              <div 
                class="dynamic-item" 
                *ngFor="let item of dynamicItems; let i = index"
                [id]="'dynamic-item-' + i">
                <span>{{ item.text }}</span>
                <button 
                  class="btn btn-sm btn-danger" 
                  (click)="removeDynamicItem(i)"
                  [disabled]="!hasControl && !!currentSession">
                  Remove
                </button>
              </div>
              <div *ngIf="dynamicItems.length === 0" class="empty-state">
                No dynamic content yet. Click "Add Dynamic Content" to start!
              </div>
            </div>

            <div class="counter-demo">
              <h4>Synchronized Counter: {{ counter }}</h4>
              <div class="counter-controls">
                <button 
                  id="decrement-btn"
                  class="btn btn-sm btn-outline" 
                  (click)="decrementCounter()"
                  [disabled]="!hasControl && !!currentSession">
                  -
                </button>
                <span class="counter-value">{{ counter }}</span>
                <button 
                  id="increment-btn"
                  class="btn btn-sm btn-outline" 
                  (click)="incrementCounter()"
                  [disabled]="!hasControl && !!currentSession">
                  +
                </button>
                <button 
                  id="reset-btn"
                  class="btn btn-sm btn-secondary" 
                  (click)="resetCounter()"
                  [disabled]="!hasControl && !!currentSession">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="info-panel">
          <h3>📊 Collaboration Status</h3>
          <div class="status-info">
            <p><strong>Connection:</strong> {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
            <p *ngIf="currentSession"><strong>Session ID:</strong> {{ currentSession.id }}</p>
            <p *ngIf="currentUser"><strong>Your Name:</strong> {{ currentUser.name }}</p>
            <p><strong>Control Status:</strong> {{ hasControl ? 'You have control' : 'Viewing only' }}</p>
            <p><strong>Participants:</strong> {{ collaborators.length }}</p>
          </div>

          <div class="collaboration-features">
            <h4>🚀 Active Features:</h4>
            <ul>
              <li>✅ Real-time cursor tracking</li>
              <li>✅ Form input synchronization</li>
              <li>✅ Button click synchronization</li>
              <li>✅ Dynamic content updates</li>
              <li>✅ Multi-user sessions</li>
              <li>✅ Control management</li>
            </ul>
          </div>

          <div class="instructions" *ngIf="!currentSession">
            <h4>🎯 How to Test:</h4>
            <ol>
              <li>Go back to home page</li>
              <li>Start a new session or join existing one</li>
              <li>Open this editor in multiple browser windows</li>
              <li>Watch real-time synchronization!</li>
            </ol>
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
          <div class="cursor-pointer" [style.background-color]="getCursorColor(cursor.userId)"></div>
          <div class="cursor-label" [style.background-color]="getCursorColor(cursor.userId)">
            {{ cursor.userName }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-left h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .session-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .session-id {
      background: #e7f3ff;
      color: #004085;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .control-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
      background: #f8f9fa;
      color: #6c757d;
    }

    .control-status.has-control {
      background: #d4edda;
      color: #155724;
    }

    .connection-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
      background: #f8d7da;
      color: #721c24;
    }

    .connection-status.connected {
      background: #d4edda;
      color: #155724;
    }

    .collaborators-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .collaborators-bar h4 {
      margin: 0;
      color: #495057;
    }

    .collaborator-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .collaborator-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .control-actions {
      display: flex;
      gap: 0.5rem;
    }

    .editor-content {
      flex: 1;
      display: grid;
      grid-template-columns: 2fr 1fr;
      overflow: hidden;
    }

    .demo-panels {
      padding: 2rem;
      overflow-y: auto;
      background: #ffffff;
    }

    .demo-panel {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .demo-panel h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 0.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.25);
    }

    .form-input:read-only, .form-select:disabled, .form-textarea:read-only {
      background-color: #f8f9fa;
      border-color: #e9ecef;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
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

    .btn-success:hover:not(:disabled) {
      background: #218838;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }

    .btn-outline {
      background: transparent;
      color: #6c757d;
      border: 1px solid #6c757d;
    }

    .btn-outline:hover {
      background: #6c757d;
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .dynamic-content {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .dynamic-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .empty-state {
      text-align: center;
      color: #6c757d;
      padding: 2rem;
      font-style: italic;
    }

    .counter-demo {
      margin-top: 1rem;
    }

    .counter-demo h4 {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .counter-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .counter-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
      min-width: 60px;
      text-align: center;
    }

    .info-panel {
      background: #f8f9fa;
      padding: 1.5rem;
      border-left: 1px solid #e9ecef;
      overflow-y: auto;
    }

    .info-panel h3 {
      margin-top: 0;
      color: #2c3e50;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0.5rem;
    }

    .info-panel h4 {
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .status-info p {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .collaboration-features ul {
      padding-left: 1rem;
      color: #495057;
    }

    .collaboration-features li {
      margin-bottom: 0.25rem;
    }

    .instructions ol {
      padding-left: 1rem;
      color: #495057;
    }

    .instructions li {
      margin-bottom: 0.5rem;
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

    @media (max-width: 1024px) {
      .editor-content {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
      }
      
      .info-panel {
        border-left: none;
        border-top: 1px solid #e9ecef;
        max-height: 300px;
      }

      .collaborators-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .header-right {
        flex-direction: column;
        align-items: flex-end;
        gap: 0.5rem;
      }
    }
  `]
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  
  // Collaboration state
  currentUser: Collaborator | null = null;
  currentSession: CollaborationSession | null = null;
  collaborators: Collaborator[] = [];
  collaborativeCursors: any[] = [];
  hasControl: boolean = false;
  isConnected: boolean = false;
  
  // Demo form data
  demoForm = {
    name: '',
    email: '',
    message: '',
    selectedOption: '',
    checkbox1: false,
    checkbox2: false
  };
  
  // Dynamic content
  dynamicItems: { text: string }[] = [];
  counter = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private collaborationService: CollaborationService,
    private cursorService: CursorService,
    private stateSyncService: StateSyncService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    console.log('🎨 Collaborative Editor loaded');
    console.log('🔍 Browser:', navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edge') ? 'Edge' : 'Other');
    this.initializeCollaboration();
  }

  ngAfterViewInit() {
    // Start syncing this component's elements
    setTimeout(() => {
      console.log('🔄 Starting element synchronization');
      this.stateSyncService.startSyncingElement(this.elementRef.nativeElement);
    }, 100);
  }

  ngOnDestroy() {
    console.log('🗑️ Editor component destroying - preserving connection');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stateSyncService.stopSyncingElement(this.elementRef.nativeElement);
    // Don't disconnect when navigating - preserve session
    // Connection should persist across page navigation
  }

  private initializeCollaboration() {
    console.log('🔌 Initializing collaboration in editor...');
    
    // Get current connection state without reinitializing
    this.currentUser = this.collaborationService.getCurrentUser();
    this.currentSession = this.collaborationService.getCurrentSession();
    
    // Get initial connection status
    this.collaborationService.connectionStatus$.pipe(
      take(1)
    ).subscribe(status => {
      this.isConnected = status;
    });
    
    console.log('🔍 Editor collaboration state:', {
      isConnected: this.isConnected,
      hasUser: !!this.currentUser,
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id
    });
    
    // Subscribe to connection status
    this.subscriptions.push(
      this.collaborationService.connectionStatus$.subscribe(status => {
        console.log('🔌 Editor connection status changed:', status);
        this.isConnected = status;
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

    // Subscribe to control status
    this.subscriptions.push(
      this.collaborationService.hasControl$.subscribe(hasControl => {
        this.hasControl = hasControl;
      })
    );

    // Subscribe to collaborative cursors
    this.subscriptions.push(
      this.cursorService.collaborativeCursors$.subscribe(cursors => {
        this.collaborativeCursors = cursors;
      })
    );

    // Subscribe to form value changes from other users
    this.subscriptions.push(
      this.stateSyncService.formValues$.subscribe(values => {
        // Update form values from collaborative changes
        Object.keys(values).forEach(key => {
          if (key in this.demoForm) {
            (this.demoForm as any)[key] = values[key];
          }
          
          if (key === 'counter') {
            this.counter = values[key];
          }
        });
      })
    );

    // Subscribe to navigation and initial state events
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
        
        if (event.type === 'initial-state') {
          console.log('🔄 Applying initial session state:', event.data);
          const initialState = event.data;
          
          // Apply initial state to form and component properties
          Object.keys(initialState).forEach(key => {
            if (key in this.demoForm) {
              (this.demoForm as any)[key] = initialState[key];
            }
            
            if (key === 'counter') {
              this.counter = initialState[key];
              console.log('🔢 Counter initialized to:', this.counter);
            }
            
            if (key === 'dynamicItems') {
              this.dynamicItems = initialState[key] || [];
              console.log('📝 Dynamic items initialized:', this.dynamicItems);
            }
          });
          
          // Also update the StateSyncService with the initial state
          Object.keys(initialState).forEach(key => {
            this.stateSyncService.updateFormValue(key, initialState[key]);
          });
        }
      })
    );

    // Current user already set in initializeCollaboration
  }

  requestControl() {
    this.collaborationService.requestControl();
  }

  releaseControl() {
    this.collaborationService.releaseControl();
  }

  goBack() {
    console.log('🔙 Navigating back to home...');
    console.log('🔍 Session check:', {
      hasSession: !!this.currentSession,
      sessionId: this.currentSession?.id,
      isConnected: this.isConnected,
      participantCount: this.collaborators.length
    });
    
    this.router.navigate(['/']);
    
    // Sync navigation if in a collaborative session
    if (this.currentSession && this.isConnected) {
      console.log('🧭 Sending navigation sync to other participants');
      this.collaborationService.sendNavigation('/');
    } else {
      console.log('⚠️ Not syncing navigation - no active session or not connected');
    }
  }

  showAlert(message: string) {
    alert(`🎉 Collaborative Alert: ${message}\n\nThis action was synchronized across all participants!`);
  }

  addDynamicContent() {
    const item = {
      text: `Dynamic item ${this.dynamicItems.length + 1} - Added by ${this.currentUser?.name || 'Unknown'} at ${new Date().toLocaleTimeString()}`
    };
    this.dynamicItems.push(item);
    
    // Manually sync this change
    this.stateSyncService.updateFormValue('dynamicItems', this.dynamicItems);
  }

  removeDynamicItem(index: number) {
    this.dynamicItems.splice(index, 1);
    
    // Manually sync this change
    this.stateSyncService.updateFormValue('dynamicItems', this.dynamicItems);
  }

  incrementCounter() {
    this.counter++;
    console.log('🔢 Incrementing counter to:', this.counter);
    
    // Send collaborative event to sync with other users
    this.collaborationService.sendEvent({
      type: 'form-change',
      data: {
        elementId: 'counter',
        value: this.counter,
        type: 'number'
      }
    });
    
    // Update local state
    this.stateSyncService.updateFormValue('counter', this.counter);
  }

  decrementCounter() {
    this.counter--;
    console.log('🔢 Decrementing counter to:', this.counter);
    
    // Send collaborative event to sync with other users
    this.collaborationService.sendEvent({
      type: 'form-change',
      data: {
        elementId: 'counter',
        value: this.counter,
        type: 'number'
      }
    });
    
    // Update local state
    this.stateSyncService.updateFormValue('counter', this.counter);
  }

  resetCounter() {
    this.counter = 0;
    console.log('🔢 Resetting counter to:', this.counter);
    
    // Send collaborative event to sync with other users
    this.collaborationService.sendEvent({
      type: 'form-change',
      data: {
        elementId: 'counter',
        value: this.counter,
        type: 'number'
      }
    });
    
    // Update local state
    this.stateSyncService.updateFormValue('counter', this.counter);
  }

  getCursorColor(userId: string): string {
    const collaborator = this.collaborators.find(c => c.id === userId);
    return collaborator?.color || '#3498db';
  }
}