import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const langRedirectGuard: CanActivateFn = (route, state) => {
  const _Router = inject(Router);
  const _PLATFORM_ID = inject(PLATFORM_ID);
  if(isPlatformBrowser(_PLATFORM_ID)) {
    const lang = localStorage.getItem('language') || 'ar';
    _Router.navigate(['/',lang,'home']);
  }
  return false;
};
