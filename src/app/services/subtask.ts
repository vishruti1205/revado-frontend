// Service for subtask CRUD operations and completion updates.
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubtaskService {
  private todosBaseUrl = 'http://localhost:8080/api/todos';
  private subtasksBaseUrl = 'http://localhost:8080/api/subtasks';

  constructor(private http: HttpClient) {}

  getByTodo(todoId: string): Observable<any> {
    // Try common backend URL patterns so frontend works across slight API variations.
    return this.http.get(`${this.subtasksBaseUrl}/todo/${todoId}`)
      .pipe(
        catchError(() => this.http.get(`${this.todosBaseUrl}/${todoId}/subtasks`)),
        catchError(() => this.http.get(`${this.subtasksBaseUrl}?todoId=${todoId}`))
      );
  }

  create(todoId: string, title: string): Observable<any> {
    // Same fallback strategy for create endpoint.
    return this.http.post(this.subtasksBaseUrl, { title, todoId })
      .pipe(
        catchError(() => this.http.post(`${this.todosBaseUrl}/${todoId}/subtasks`, { title })),
        catchError(() => this.http.post(`${this.subtasksBaseUrl}?todoId=${todoId}`, { title }))
      );
  }

  delete(subtaskId: string, todoId: string): Observable<any> {
    return this.http.delete(
      `${this.subtasksBaseUrl}/${subtaskId}`,
      { responseType: 'text' as const }
    ).pipe(
      catchError(() => this.http.delete(
        `${this.todosBaseUrl}/${todoId}/subtasks/${subtaskId}`,
        { responseType: 'text' as const }
      ))
    );
  }

  updateCompleted(subtaskId: string, value: boolean, todoId: string): Observable<any> {
    return this.http.put(
      `${this.subtasksBaseUrl}/${subtaskId}/completed?value=${value}`,
      {}
    ).pipe(
      catchError(() => this.http.put(
        `${this.todosBaseUrl}/${todoId}/subtasks/${subtaskId}/completed?value=${value}`,
        {}
      ))
    );
  }

  updateTitle(subtaskId: string, title: string): Observable<any> {
    // Exact API contract from backend:
    // PUT /api/subtasks/{id}
    // Body: { "title": "..." }
    return this.http.put(`${this.subtasksBaseUrl}/${subtaskId}`, { title });
  }
}
