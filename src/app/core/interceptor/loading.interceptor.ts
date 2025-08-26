import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // أضف معلومات مخصصة لتحديد المصدر
    console.log(`Request URL: ${req.url} | Initiated from: ${req.headers.get('X-Component-Source') || 'Unknown'}`);
    return next.handle(req);
  }
}