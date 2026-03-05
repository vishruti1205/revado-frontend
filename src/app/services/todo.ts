// Service for todo CRUD operations and completion updates.
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/*
  TODO SERVICE- This service handles all HTTP calls related to Todos.
  We DO NOT manually attach JWT headers here.
  The authInterceptor automatically adds Authorization header.
*/

@Injectable({
  providedIn: 'root'   // Makes this service available globally
})
export class TodoService {

  // Base URL of Spring Boot backend
  private baseUrl = 'http://localhost:8080/api/todos';

  constructor(private http: HttpClient) {}

  /*
    CREATE NEW TODO
    POST /api/todos
  */
  createTodo(todo: any) {
    return this.http.post(this.baseUrl, todo);
  }

  /*
    GET ALL TODOS
    GET /api/todos
  */
  getTodos() {
    // Add a cache-busting query param so list refresh always fetches latest data.
    return this.http.get(`${this.baseUrl}?_=${Date.now()}`);
  }

  /*
    DELETE TODO
    DELETE /api/todos/{id}

    Spring Boot returns 200 OK with empty body.
    So we set responseType to 'text' to avoid JSON parse error.
  */
  deleteTodo(id: string) {
    return this.http.delete(
      `${this.baseUrl}/${id}`,
      { responseType: 'text' as const }
    );
  }

  /*
    UPDATE COMPLETED STATUS
    PUT /api/todos/{id}/completed?value=true/false
  */
  updateCompleted(id: string, value: boolean) {
    return this.http.put(
      `${this.baseUrl}/${id}/completed?value=${value}`,
      {}
    );
  }

  /*
    UPDATE TITLE
    PUT /api/todos/{id}
  */
  updateTitle(id: string, title: string): Observable<any> {
    // Exact API contract from backend:
    // PUT /api/todos/{id}
    // Body: { "title": "..." }
    return this.http.put(`${this.baseUrl}/${id}`, { title });
  }
}
