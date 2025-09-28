import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

export const setPasswordGuardGuard: CanActivateFn = (route, state) => {
  const _PLATFORM_ID = inject(PLATFORM_ID);
  const _Router = inject(Router);
  const _AuthService = inject(AuthService);
  if(isPlatformBrowser(_PLATFORM_ID)){
    const isPassword = localStorage.getItem('isPassword');
    if(isPassword === 'true') {
      _AuthService.logout();
      _Router.navigate(['/',localStorage.getItem("language"),'login']);
      return false;
    }
  }
  return true;
};
