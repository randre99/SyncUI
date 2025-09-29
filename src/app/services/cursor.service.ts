import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CollaborationService } from './collaboration.service';
import { CursorMoveEvent } from './collaboration.types';

@Injectable({
  providedIn: 'root'
})
export class CursorService {
  private collaborativeCursorsSubject = new BehaviorSubject<CursorMoveEvent[]>([]);
  private currentCursors = new Map<string, CursorMoveEvent>();
  
  public collaborativeCursors$ = this.collaborativeCursorsSubject.asObservable();

  constructor(
    private collaborationService: CollaborationService,
    private ngZone: NgZone
  ) {
    this.initializeCursorTracking();
    this.listenForCollaborativeCursors();
  }

  private initializeCursorTracking(): void {
    this.ngZone.runOutsideAngular(() => {
      let throttleTimeout: any = null;

      document.addEventListener('mousemove', (event: MouseEvent) => {
        if (throttleTimeout) return;
        
        throttleTimeout = setTimeout(() => {
          this.ngZone.run(() => {
            this.sendCursorPosition(event.clientX, event.clientY);
          });
          throttleTimeout = null;
        }, 16); // ~60fps
      });

      // Hide cursor when mouse leaves the document
      document.addEventListener('mouseleave', () => {
        this.ngZone.run(() => {
          this.sendCursorPosition(-1000, -1000);
        });
      });
    });
  }

  private listenForCollaborativeCursors(): void {
    this.collaborationService.getCollaborativeEvents().subscribe((event: any) => {
      if (event.type === 'cursor-move') {
        const cursorEvent = event.data as CursorMoveEvent;
        
        // Don't show our own cursor
        const currentUser = this.collaborationService.getCurrentUser();
        if (currentUser && cursorEvent.userId === currentUser.id) {
          return;
        }

        this.updateCollaborativeCursor(cursorEvent);
      }
    });
  }

  private sendCursorPosition(x: number, y: number): void {
    const currentUser = this.collaborationService.getCurrentUser();
    if (!currentUser) return;

    const cursorEvent: CursorMoveEvent = {
      x,
      y,
      userId: currentUser.id,
      userName: currentUser.name
    };

    this.collaborationService.sendEvent({
      type: 'cursor-move',
      data: cursorEvent
    });
  }

  private updateCollaborativeCursor(cursorEvent: CursorMoveEvent): void {
    // Hide cursor if it's off-screen
    if (cursorEvent.x < 0 || cursorEvent.y < 0) {
      this.currentCursors.delete(cursorEvent.userId);
    } else {
      this.currentCursors.set(cursorEvent.userId, cursorEvent);
    }

    // Remove stale cursors (older than 5 seconds)
    const now = Date.now();
    for (const [userId, cursor] of this.currentCursors.entries()) {
      if (now - (cursor as any).lastUpdate > 5000) {
        this.currentCursors.delete(userId);
      }
    }

    // Update the observable
    this.collaborativeCursorsSubject.next(Array.from(this.currentCursors.values()));
  }

  public clearAllCursors(): void {
    this.currentCursors.clear();
    this.collaborativeCursorsSubject.next([]);
  }
}