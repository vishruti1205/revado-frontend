// HTTP interceptor that attaches the JWT token to outgoing API requests.
import { HttpInterceptorFn } from '@angular/common/http';

/*
  JWT AUTH INTERCEPTOR- This interceptor runs before every HTTP request.

  Purpose:Automatically attach JWT token (if present) to the Authorization header.

  This way:
  We do NOT manually add headers in every service
  Token logic is centralized
  Cleaner and scalable architecture
*/

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Read token from browser localStorage
  const token = localStorage.getItem('token');

  // If token exists, attach it
  if (token) {

    // Clone original request and add Authorization header
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Send modified request to backend
    return next(clonedRequest);
  }

  // If no token exists, send original request unchanged
  return next(req);
};
