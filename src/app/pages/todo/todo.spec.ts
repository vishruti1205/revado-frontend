// Unit tests for the todo component.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TodoComponent } from './todo';
import { SubtaskService } from '../../services/subtask';
import { TodoService } from '../../services/todo';

describe('Todo', () => {
  let component: TodoComponent;
  let fixture: ComponentFixture<TodoComponent>;

  beforeEach(async () => {
    const todoServiceMock = {
      getTodos: () => of([]),
      createTodo: () => of({}),
      deleteTodo: () => of({}),
      updateCompleted: () => of({}),
      updateTitle: () => of({})
    };

    const subtaskServiceMock = {
      getByTodo: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [TodoComponent],
      providers: [
        { provide: TodoService, useValue: todoServiceMock },
        { provide: SubtaskService, useValue: subtaskServiceMock },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
