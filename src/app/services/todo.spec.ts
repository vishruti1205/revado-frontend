// Unit tests for the todo service.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TodoService } from './todo';

describe('Todo', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
