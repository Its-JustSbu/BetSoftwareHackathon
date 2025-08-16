import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable()
export class Auth implements HttpInterceptor {
  constructor() {}

    intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const sessionid = localStorage.getItem('sessionid');
    const csrftoken = localStorage.getItem('csrftoken');

    if (sessionid && csrftoken) {
      // Clone the request and attach the token
      const authReq = req.clone({
        setHeaders: {
          'Set-Cookie': `csrftoken=${csrftoken}; sessionid=${sessionid}`
        }
      });

      return next.handle(authReq);
    }

    // If there is no token, pass the original request
    return next.handle(req);
  }
}