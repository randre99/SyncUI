import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Collaborative UI Sync</h1>
        <div class="collaboration-status">
          <span class="status-indicator connected">
            Ready for Collaboration
          </span>
        </div>
      </header>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .collaboration-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      background: #27ae60;
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .app-main {
      flex: 1;
      overflow: auto;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'collaborative-ui-sync';

  constructor() {}

  ngOnInit() {
    console.log('Collaborative UI Sync App Started!');
  }

  ngOnDestroy() {
    console.log('App destroyed');
  }
}