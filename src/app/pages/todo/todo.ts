// Todo page component: handles listing, creating, deleting, and completing todos.
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService } from '../../services/todo';
import { SubtaskService } from '../../services/subtask';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.html'
})
export class TodoComponent implements OnInit {

  // This array stores all todos received from backend
  todos: any[] = [];

  // This object is bound to input field using ngModel
  newTodo = { title: '' };
  todoStatusNote = '';
  editingTodoId: any = null;
  editingTodoTitle = '';

  // Injecting TodoService to call backend APIs
  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private subtaskService: SubtaskService
  ) {}

  // Runs automatically when component loads
  // Used to fetch all todos from backend
  ngOnInit(): void {
    this.loadTodos();
  }

  // This method calls backend GET API
  // It loads all todos into the "todos" array
  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (res: any) => {
        this.todos = this.extractTodos(res);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load error:', err);
      }
    });
  }

  // Called when user clicks "Add" button
  // Sends new todo to backend
  addTodo(): void {
    const title = this.newTodo.title.trim();

    // Do not allow empty title
    if (!title) return;

    this.todoService.createTodo({ title }).subscribe({
      next: (created: any) => {
        // Clear input field after successful creation
        this.newTodo.title = '';

        const createdTodo = this.extractCreatedTodo(created);
        if (createdTodo) {
          this.prependIfMissing(createdTodo);
        } else {
          // Fallback when backend does not return created object.
          this.prependIfMissing({
            id: `tmp-${Date.now()}`,
            title,
            completed: false
          });
        }

        this.cdr.detectChanges();
        // Sync shortly after create so temporary item/id is reconciled from backend.
        setTimeout(() => this.loadTodos(), 150);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Called when user clicks "Delete"
  deleteTodo(todo: any): void {
    const id = todo?.id;
    if (!id) return;

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        // Remove deleted todo from UI instantly
        this.todos = this.todos.filter(t => t.id !== id);
        this.cdr.detectChanges();
        // Re-sync with backend to avoid UI drift.
        setTimeout(() => this.loadTodos(), 100);
      },
      error: (err) => console.error(err)
    });
  }

  startEditTodo(todo: any): void {
    const id = todo?.id;
    if (!id) return;

    this.todoStatusNote = '';
    this.editingTodoId = id;
    this.editingTodoTitle = String(todo?.title ?? '');
  }

  cancelEditTodo(): void {
    this.editingTodoId = null;
    this.editingTodoTitle = '';
  }

  saveEditTodo(todo: any): void {
    const id = todo?.id;
    if (!id || this.editingTodoId !== id) return;

    const currentTitle = String(todo?.title ?? '');
    const trimmed = this.editingTodoTitle.trim();
    if (!trimmed) {
      this.todoStatusNote = 'Title cannot be empty.';
      this.cdr.detectChanges();
      return;
    }
    if (trimmed === currentTitle) {
      this.cancelEditTodo();
      return;
    }

    const previous = currentTitle;
    todo.title = trimmed;
    this.cdr.detectChanges();

    this.todoService.updateTitle(id, trimmed).subscribe({
      next: () => {
        this.cancelEditTodo();
        setTimeout(() => this.loadTodos(), 100);
      },
      error: (err) => {
        todo.title = previous;
        this.cdr.detectChanges();
        console.error('Edit todo error:', err);
        this.todoStatusNote = 'Unable to update todo title on server.';
      }
    });
  }

  // Called when checkbox is clicked
  // Toggles completed status
  toggleComplete(todo: any): void {
    const id = todo?.id;
    if (!id) return;
    const previous = !!todo.completed;
    const nextValue = !previous;

    this.todoStatusNote = '';

    // Business rule:
    // Allow marking todo as complete only when all its subtasks are complete.
    if (nextValue) {
      this.subtaskService.getByTodo(id).subscribe({
        next: (res: any) => {
          // Subtasks can arrive in different response shapes; normalize first.
          const subtasks = this.extractSubtasks(res);
          const hasPendingSubtasks = subtasks.some(s => !s?.completed);

          if (hasPendingSubtasks) {
            // Block parent completion and guide user to finish subtasks first.
            this.todoStatusNote = 'Your subtasks are pending. Complete all subtasks before marking this todo complete.';
            this.cdr.detectChanges();
            return;
          }

          // Safe to continue only when no pending subtasks exist.
          this.applyTodoCompletionUpdate(todo, previous, nextValue);
        },
        error: () => {
          // Do not allow completion if subtask validation fails.
          this.todoStatusNote = 'Unable to validate subtasks right now. Try again.';
          this.cdr.detectChanges();
        }
      });
      return;
    }

    // Unchecking completion does not require subtask validation.
    this.applyTodoCompletionUpdate(todo, previous, nextValue);
  }

  openSubtasks(todo: any): void {
    const id = todo?.id;
    if (!id) return;

    // Prevent editing subtasks once parent todo is completed.
    if (todo?.completed) {
      this.todoStatusNote = 'This task list is already completed. Please make new task list.';
      this.cdr.detectChanges();
      return;
    }

    // Open subtask screen for the selected todo.
    this.router.navigate(['/subtasks', id]);
  }

  private extractTodos(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.content)) return res.content;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private extractCreatedTodo(res: any): any | null {
    if (res && typeof res === 'object') return res;

    if (typeof res === 'string') {
      try {
        const parsed = JSON.parse(res);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        return null;
      }
    }

    return null;
  }

  private prependIfMissing(todo: any): void {
    if (!todo) return;

    const id = todo?.id;
    if (id && this.todos.some(t => t?.id === id)) return;

    this.todos = [todo, ...this.todos];
  }

  private applyTodoCompletionUpdate(todo: any, previous: boolean, nextValue: boolean): void {
    const id = todo?.id;
    if (!id) return;

    // Optimistically update UI on first click.
    todo.completed = nextValue;
    this.cdr.detectChanges();

    this.todoService.updateCompleted(id, nextValue)
      .subscribe({
        next: () => {
          // Re-sync with backend to keep state accurate.
          setTimeout(() => this.loadTodos(), 100);
        },
        error: (err) => {
          // Roll back on API error.
          todo.completed = previous;
          this.cdr.detectChanges();
          console.error(err);
        }
      });
  }

  private extractSubtasks(res: any): any[] {
    // Accept plain array and common paginated/wrapped response formats.
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.content)) return res.content;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }
}
