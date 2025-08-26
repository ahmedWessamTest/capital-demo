import { Injectable, NgZone, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavbarHeightService {
  private navbarHeightSubject = new BehaviorSubject<number>(0);
  navbarHeight$ = this.navbarHeightSubject.asObservable();

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initNavbarHeightListener();
    }
  }

  private initNavbarHeightListener() {
    this.updateNavbarHeight();
    
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => {
          this.ngZone.run(() => this.updateNavbarHeight());
        });
    });
  }

  private updateNavbarHeight() {
    const navbar = document.querySelector('header');
    const height = navbar ? navbar.offsetHeight : 60; // Fallback to 60px
    this.navbarHeightSubject.next(height);
  }

  getNavbarHeight(): number {
    return this.navbarHeightSubject.getValue();
  }
}