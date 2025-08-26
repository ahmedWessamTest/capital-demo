import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LanguageService } from '../services/language.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const platformId = inject(PLATFORM_ID);

  // Check if running in browser
  if (isPlatformBrowser(platformId)) {
    // Fast check - if token exists, redirect to home
    if (localStorage.getItem('auth_token') != null) {
      return languageService
        .currentLanguage$
        .pipe(map((lang) => router.createUrlTree(['/', lang, 'home'])));
    }
  }

  // No token or not in browser, allow access to login/register
  return true;
};