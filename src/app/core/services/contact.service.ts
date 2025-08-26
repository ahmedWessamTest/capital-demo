import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, of, tap, shareReplay } from 'rxjs';
import { API_CONFIG } from '@core/conf/api.config';

export interface ContactFormErrors {
  name?: string[];
  email?: string[];
  phone?: string[];
  message?: string[];
}

export interface ContactFormResponse {
  errors?: ContactFormErrors;
  message?: string;
  success?: boolean;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;
  
  // Cache expiration time (5 minutes)
  private readonly CACHE_EXPIRATION = 5 * 60 * 1000;
  
  // Cache signals
  private contactFormCache = signal<ContactFormResponse | null>(null);
  
  // Cache timestamps
  private cacheTimestamp = signal<number>(0);
  
  // BehaviorSubject for backward compatibility
  private contactFormSubject = new BehaviorSubject<ContactFormResponse | null>(null);
  
  // Public observable
  contactForm$ = this.contactFormSubject.asObservable();
  
  // Signal getter
  get contactForm() {
    return this.contactFormCache;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  submitContactForm(payload: ContactFormPayload): Observable<ContactFormResponse> {
    if (!this.isBrowser()) {
      return new Observable<ContactFormResponse>(observer => {
        observer.complete();
      });
    }

    // Check if cache is valid
    if (this.isCacheValid() && this.contactFormCache()) {
      const cachedData = this.contactFormCache()!;
      this.contactFormSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.post<ContactFormResponse>(
      `${this.baseUrl}app-home/submitContact`,
      payload
    ).pipe(
      tap(data => {
        this.contactFormCache.set(data);
        this.updateCacheTimestamp();
        this.contactFormSubject.next(data);
      }),
      shareReplay(1)
    );

    return observable;
  }

  // Invalidate cache
  invalidateCache(): void {
    this.contactFormCache.set(null);
    this.contactFormSubject.next(null);
    this.cacheTimestamp.set(0);
  }

  // Set custom expiration
  setCacheExpiration(expirationMs: number): void {
    this.updateCacheTimestamp(Date.now() + expirationMs);
  }

  // Clear cache
  clearCache(): void {
    this.contactFormCache.set(null);
    this.contactFormSubject.next(null);
    this.cacheTimestamp.set(0);
  }

  private isCacheValid(): boolean {
    const timestamp = this.cacheTimestamp();
    if (timestamp === 0) return false;
    return Date.now() - timestamp < this.CACHE_EXPIRATION;
  }

  private updateCacheTimestamp(time = Date.now()): void {
    this.cacheTimestamp.set(time);
  }
}