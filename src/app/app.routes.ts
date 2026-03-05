import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { TodoComponent } from './pages/todo/todo';
import { SubtaskitemComponent } from './pages/subtaskitem/subtaskitem';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'todo', component: TodoComponent },
  { path: 'subtasks/:todoId', component: SubtaskitemComponent }

];