// Unit tests for the subtask item component.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { SubtaskitemComponent } from './subtaskitem';
import { SubtaskService } from '../../services/subtask';

describe('Subtaskitem', () => {
  let component: SubtaskitemComponent;
  let fixture: ComponentFixture<SubtaskitemComponent>;

  beforeEach(async () => {
    const subtaskServiceMock = {
      getByTodo: () => of([]),
      create: () => of({}),
      delete: () => of({}),
      updateCompleted: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [SubtaskitemComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'todo-1'
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true)
          }
        },
        { provide: SubtaskService, useValue: subtaskServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtaskitemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
