import { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  const cloned = req.clone({
    setHeaders: {
      'X-Request-Id': requestId
    }
  });

  return next(cloned);
};
