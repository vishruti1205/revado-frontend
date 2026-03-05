// Subtask page component: manages subtasks for a selected todo item.
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubtaskService } from '../../services/subtask';

@Component({
  selector: 'app-subtaskitem',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './subtaskitem.html'
})
export class SubtaskitemComponent implements OnInit {

  todoId = '';
  subtasks: any[] = [];
  newSubtask = { title: '' };
  editingSubtaskId: any = null;
  editingSubtaskTitle = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subtaskService: SubtaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Read parent todo id from route: /subtasks/:todoId
    this.todoId = this.route.snapshot.paramMap.get('todoId') || '';
    if (!this.todoId) {
      this.router.navigate(['/todo']);
      return;
    }
    this.loadSubtasks();
  }

  addSubtask() {
    const title = this.newSubtask.title.trim();
    if (!title) return;

    this.subtaskService.create(this.todoId, title).subscribe({
      next: (created: any) => {
        this.newSubtask.title = '';

        const createdItem = this.extractCreatedSubtask(created);
        if (createdItem) {
          this.prependIfMissing(createdItem);
        } else {
          this.prependIfMissing({
            id: `tmp-${Date.now()}`,
            title,
            completed: false
          });
        }

        this.cdr.detectChanges();
        // Short delayed re-fetch to align local UI with backend source of truth.
        setTimeout(() => this.loadSubtasks(), 120);
      },
      error: (err) => console.error('Create subtask error:', err)
    });
  }

  loadSubtasks(): void {
    this.subtaskService.getByTodo(this.todoId).subscribe({
      next: (res: any) => {
        this.subtasks = this.extractSubtasks(res);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Load subtask error:', err)
    });
  }

  deleteSubtask(subtask: any): void {
    const id = subtask?.id;
    if (!id) return;

    this.subtaskService.delete(id, this.todoId).subscribe({
      next: () => {
        this.subtasks = this.subtasks.filter(s => s.id !== id);
        this.cdr.detectChanges();
        setTimeout(() => this.loadSubtasks(), 100);
      },
      error: (err) => console.error('Delete subtask error:', err)
    });
  }

  startEditSubtask(subtask: any): void {
    const id = subtask?.id;
    if (!id) return;

    this.editingSubtaskId = id;
    this.editingSubtaskTitle = String(subtask?.title ?? '');
  }

  cancelEditSubtask(): void {
    this.editingSubtaskId = null;
    this.editingSubtaskTitle = '';
  }

  saveEditSubtask(subtask: any): void {
    const id = subtask?.id;
    if (!id || this.editingSubtaskId !== id) return;

    const currentTitle = String(subtask?.title ?? '');
    const trimmed = this.editingSubtaskTitle.trim();
    if (!trimmed) return;
    if (trimmed === currentTitle) {
      this.cancelEditSubtask();
      return;
    }

    const previous = currentTitle;
    subtask.title = trimmed;
    this.cdr.detectChanges();

    this.subtaskService.updateTitle(id, trimmed).subscribe({
      next: () => {
        this.cancelEditSubtask();
        setTimeout(() => this.loadSubtasks(), 100);
      },
      error: (err) => {
        subtask.title = previous;
        this.cdr.detectChanges();
        console.error('Edit subtask error:', err);
        window.alert('Unable to update subtask title on server.');
      }
    });
  }

  toggleComplete(subtask: any): void {
    const id = subtask?.id;
    if (!id) return;

    const previous = !!subtask.completed;
    const nextValue = !previous;

    // Optimistic update: reflect user click immediately.
    subtask.completed = nextValue;
    this.cdr.detectChanges();

    this.subtaskService.updateCompleted(id, nextValue, this.todoId).subscribe({
      next: () => setTimeout(() => this.loadSubtasks(), 100),
      error: (err) => {
        // Roll back if backend update fails.
        subtask.completed = previous;
        this.cdr.detectChanges();
        console.error('Toggle subtask error:', err);
      }
    });
  }

  goBackToTodos(): void {
    this.router.navigate(['/todo']);
  }

  private extractSubtasks(res: any): any[] {
    // Support multiple response envelope styles.
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.content)) return res.content;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private extractCreatedSubtask(res: any): any | null {
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

  private prependIfMissing(item: any): void {
    if (!item) return;

    const id = item?.id;
    if (id && this.subtasks.some(s => s?.id === id)) return;

    this.subtasks = [item, ...this.subtasks];
  }
}
