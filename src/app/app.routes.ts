import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CollaborativeEditorComponent } from './components/collaborative-editor/collaborative-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'editor', component: CollaborativeEditorComponent },
  { path: '**', redirectTo: '' }
];