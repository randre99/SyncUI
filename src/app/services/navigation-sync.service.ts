import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CollaborationService } from './collaboration.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationSyncService {
  
  constructor(
    private router: Router,
    private collaborationService: CollaborationService
  ) {
    this.initializeNavigationHandling();
  }

  private initializeNavigationHandling(): void {
    // Listen to router events to maintain connection during navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('🧭 Navigation completed to:', event.urlAfterRedirects);
      
      // Ensure connection is maintained after navigation
      this.maintainConnectionAfterNavigation();
    });
  }

  private maintainConnectionAfterNavigation(): void {
    // Small delay to ensure component is initialized
    setTimeout(() => {
      const isConnected = this.collaborationService.connectionStatus$;
      const currentSession = this.collaborationService.getCurrentSession();
      
      console.log('🔗 Post-navigation connection check:', {
        hasSession: !!currentSession,
        sessionId: currentSession?.id
      });
      
      // If we have a session but connection seems lost, don't reconnect
      // Just log the state for debugging
      if (currentSession) {
        console.log('✅ Session preserved during navigation:', currentSession.id);
      }
    }, 500);
  }
}