import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

export const deSetPasswordGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const _PLATFORM_ID = inject(PLATFORM_ID);
  const isPassword = isPlatformBrowser(_PLATFORM_ID) && localStorage.getItem('isPassword');
  if(isPassword === 'false') {
    alert("Please set your password before leaving this page.");
    return false;
  }
  return true;
};
