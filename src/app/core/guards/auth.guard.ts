import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LanguageService } from '../services/language.service';
import { AlertService } from '../shared/alert/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const languageService = inject(LanguageService);
  const alertService = inject(AlertService);
  const platformId = inject(PLATFORM_ID);

  // Check if running in browser
  if (isPlatformBrowser(platformId)) {
    // Fast path - check if token exists
    if (localStorage.getItem('auth_token') != null) {
      return true;
    }
  }

  // Slow path - user not logged in or not in browser, handle redirect
  return languageService.currentLanguage$.pipe(
    map((lang) => {
      alertService.showNotification({
        imagePath: '/images/common/unauth.webp',
        translationKeys: {
          title: 'unauth',
        },
      });
      return router.createUrlTree(['/', lang, 'login']);
    })
  );
};