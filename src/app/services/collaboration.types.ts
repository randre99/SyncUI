export interface CollaborativeEvent {
  type: 'dom-change' | 'form-input' | 'click' | 'scroll' | 'cursor-move' | 'form-change' | 'selection-change' | 'navigation';
  data: any;
  timestamp: number;
  userId: string;
  sessionId: string;
}

export interface DomChangeEvent {
  elementId: string;
  elementSelector: string;
  changeType: 'attribute' | 'textContent' | 'innerHTML' | 'style';
  oldValue: any;
  newValue: any;
  elementPath: string[];
}

export interface FormInputEvent {
  elementId: string;
  elementName: string;
  elementType: string;
  value: any;
  elementPath: string[];
}

export interface ClickEvent {
  elementId: string;
  elementType: string;
  className: string;
  x: number;
  y: number;
}

export interface ScrollEvent {
  elementId: string;
  scrollTop: number;
  scrollLeft: number;
}

export interface FormChangeEvent {
  elementId: string;
  value: any;
  type: string;
}

export interface SelectionChangeEvent {
  elementId: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface NavigationEvent {
  route: string;
  params?: any;
}

export interface CursorMoveEvent {
  x: number;
  y: number;
  userId: string;
  userName: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  isOwner: boolean;
  hasControl: boolean;
  joinedAt: Date;
}

export interface CollaborationSession {
  id: string;
  ownerId: string;
  participants: Collaborator[];
  createdAt: Date;
  isActive: boolean;
}