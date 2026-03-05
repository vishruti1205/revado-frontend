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
  const rawToken = localStorage.getItem('token');
  const token = normalizeToken(rawToken);

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

function normalizeToken(rawToken: string | null): string {
  if (!rawToken) return '';

  let token = rawToken.trim();

  // Handle accidentally stored quoted token values.
  if (token.startsWith('"') && token.endsWith('"') && token.length >= 2) {
    token = token.slice(1, -1);
  }

  // Handle accidentally stored "Bearer <token>" values.
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }

  return token;
}
