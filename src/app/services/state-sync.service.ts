import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CollaborationService } from './collaboration.service';
import { 
  FormChangeEvent, 
  ClickEvent, 
  ScrollEvent, 
  SelectionChangeEvent 
} from './collaboration.types';

@Injectable({
  providedIn: 'root'
})
export class StateSyncService {
  private isReceivingUpdate = false;
  private observerTargets = new Set<Element>();
  private formValues = new BehaviorSubject<{[key: string]: any}>({});
  
  public formValues$ = this.formValues.asObservable();

  constructor(
    private collaborationService: CollaborationService,
    private ngZone: NgZone
  ) {
    this.listenForCollaborativeEvents();
  }

  public startSyncingElement(element: Element): void {
    if (this.observerTargets.has(element)) return;
    
    this.observerTargets.add(element);
    this.setupElementTracking(element);
  }

  public stopSyncingElement(element: Element): void {
    this.observerTargets.delete(element);
  }

  private setupElementTracking(element: Element): void {
    this.ngZone.runOutsideAngular(() => {
      // Track form inputs
      element.addEventListener('input', this.handleInputChange.bind(this));
      element.addEventListener('change', this.handleInputChange.bind(this));
      
      // Track clicks
      element.addEventListener('click', (event: Event) => this.handleClick(event as MouseEvent));
      
      // Track scrolling
      element.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 50));
      
      // Track selection changes (for text inputs)
      element.addEventListener('select', this.handleSelectionChange.bind(this));
      element.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    });
  }

  private handleInputChange(event: Event): void {
    if (this.isReceivingUpdate) {
      console.log('🔄 Skipping input change - receiving update');
      return;
    }
    
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!target.id && !target.name) {
      console.log('⚠️ Skipping input change - no id or name');
      return;
    }
    
    const identifier = target.id || target.name;
    let value: any = target.value;
    
    // Handle different input types
    if (target instanceof HTMLInputElement) {
      switch (target.type) {
        case 'checkbox':
        case 'radio':
          value = target.checked;
          break;
        case 'number':
          value = target.valueAsNumber;
          break;
        case 'range':
          value = target.valueAsNumber;
          break;
      }
    }

    this.ngZone.run(() => {
      const formChangeEvent: FormChangeEvent = {
        elementId: identifier,
        value: value,
        type: target.type || 'text'
      };

      console.log(`📝 Sending form change for ${identifier}:`, value);
      
      this.collaborationService.sendEvent({
        type: 'form-change',
        data: formChangeEvent
      });

      // Update local state
      const currentValues = this.formValues.value;
      this.formValues.next({
        ...currentValues,
        [identifier]: value
      });
    });
  }

  private handleClick(event: MouseEvent): void {
    if (this.isReceivingUpdate) return;
    
    const target = event.target as HTMLElement;
    const elementInfo = this.getElementInfo(target);
    
    this.ngZone.run(() => {
      const clickEvent: ClickEvent = {
        elementId: elementInfo.id,
        elementType: elementInfo.tagName,
        className: elementInfo.className,
        x: event.clientX,
        y: event.clientY
      };

      this.collaborationService.sendEvent({
        type: 'click',
        data: clickEvent
      });
    });
  }

  private handleScroll(event: Event): void {
    if (this.isReceivingUpdate) return;
    
    const target = event.target as HTMLElement;
    const elementInfo = this.getElementInfo(target);
    
    this.ngZone.run(() => {
      const scrollEvent: ScrollEvent = {
        elementId: elementInfo.id,
        scrollTop: target.scrollTop,
        scrollLeft: target.scrollLeft
      };

      this.collaborationService.sendEvent({
        type: 'scroll',
        data: scrollEvent
      });
    });
  }

  private handleSelectionChange(event: Event): void {
    if (this.isReceivingUpdate) return;
    
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (!target.id && !target.name) return;
    
    const identifier = target.id || target.name;
    
    this.ngZone.run(() => {
      const selectionEvent: SelectionChangeEvent = {
        elementId: identifier,
        selectionStart: target.selectionStart || 0,
        selectionEnd: target.selectionEnd || 0
      };

      this.collaborationService.sendEvent({
        type: 'selection-change',
        data: selectionEvent
      });
    });
  }

  private listenForCollaborativeEvents(): void {
    this.collaborationService.getCollaborativeEvents().subscribe((event: any) => {
      // Don't process our own events
      const currentUser = this.collaborationService.getCurrentUser();
      if (currentUser && event.userId === currentUser.id) {
        console.log(`🔄 Ignoring own event: ${event.type}`);
        return;
      }

      console.log(`📥 Processing collaborative event: ${event.type} from ${event.userId}`);
      this.isReceivingUpdate = true;
      
      try {
        switch (event.type) {
          case 'form-change':
            this.applyFormChange(event.data as FormChangeEvent);
            break;
          case 'click':
            this.applyClick(event.data as ClickEvent);
            break;
          case 'scroll':
            this.applyScroll(event.data as ScrollEvent);
            break;
          case 'selection-change':
            this.applySelectionChange(event.data as SelectionChangeEvent);
            break;
          default:
            console.log(`🤷 Unknown event type: ${event.type}`);
        }
      } catch (error) {
        console.error(`❌ Error processing event ${event.type}:`, error);
      } finally {
        setTimeout(() => {
          this.isReceivingUpdate = false;
        }, 100);
      }
    });
  }

  private applyFormChange(data: FormChangeEvent): void {
    console.log(`📥 Applying form change for ${data.elementId}:`, data.value);
    
    // Handle special cases that don't correspond to DOM elements
    if (data.elementId === 'counter' || data.elementId === 'dynamicItems') {
      console.log(`✅ Applied non-DOM form change: ${data.elementId} = ${data.value}`);
      const currentValues = this.formValues.value;
      this.formValues.next({
        ...currentValues,
        [data.elementId]: data.value
      });
      return;
    }
    
    const element = document.getElementById(data.elementId) || 
                   document.querySelector(`[name="${data.elementId}"]`);
    
    if (!element) {
      console.warn(`⚠️ Element not found: ${data.elementId}`);
      // Still update local state for non-DOM elements
      const currentValues = this.formValues.value;
      this.formValues.next({
        ...currentValues,
        [data.elementId]: data.value
      });
      return;
    }
    
    const target = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    if (target instanceof HTMLInputElement) {
      switch (target.type) {
        case 'checkbox':
        case 'radio':
          target.checked = Boolean(data.value);
          console.log(`✅ Applied checkbox/radio change: ${data.elementId} = ${data.value}`);
          break;
        default:
          target.value = String(data.value);
          console.log(`✅ Applied input change: ${data.elementId} = ${data.value}`);
      }
    } else {
      target.value = String(data.value);
      console.log(`✅ Applied textarea/select change: ${data.elementId} = ${data.value}`);
    }

    // Trigger change event
    target.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Update local state
    const currentValues = this.formValues.value;
    this.formValues.next({
      ...currentValues,
      [data.elementId]: data.value
    });
  }

  private applyClick(data: ClickEvent): void {
    // Visual feedback for collaborative clicks
    this.showClickFeedback(data.x, data.y);
    
    // If it's a button, simulate the click
    const element = document.getElementById(data.elementId);
    if (element && (element.tagName === 'BUTTON' || element.onclick)) {
      element.click();
    }
  }

  private applyScroll(data: ScrollEvent): void {
    const element = document.getElementById(data.elementId) || document.documentElement;
    if (element) {
      element.scrollTop = data.scrollTop;
      element.scrollLeft = data.scrollLeft;
    }
  }

  private applySelectionChange(data: SelectionChangeEvent): void {
    const element = document.getElementById(data.elementId) || 
                   document.querySelector(`[name="${data.elementId}"]`);
    
    if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      element.setSelectionRange(data.selectionStart, data.selectionEnd);
    }
  }

  private showClickFeedback(x: number, y: number): void {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.6);
      pointer-events: none;
      z-index: 10000;
      animation: ripple 0.6s ease-out;
    `;
    
    // Add ripple animation if not exists
    if (!document.querySelector('#ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 600);
  }

  private getElementInfo(element: HTMLElement): { id: string; tagName: string; className: string } {
    return {
      id: element.id || this.generateElementId(element),
      tagName: element.tagName.toLowerCase(),
      className: element.className
    };
  }

  private generateElementId(element: HTMLElement): string {
    // Generate a stable ID based on element position and content
    const rect = element.getBoundingClientRect();
    const content = element.textContent?.slice(0, 20) || '';
    return `elem_${element.tagName}_${Math.round(rect.top)}_${Math.round(rect.left)}_${content.replace(/\s/g, '')}`;
  }

  private throttle(func: Function, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  public getFormValues(): {[key: string]: any} {
    return this.formValues.value;
  }

  public updateFormValue(key: string, value: any): void {
    const currentValues = this.formValues.value;
    this.formValues.next({
      ...currentValues,
      [key]: value
    });
  }
}