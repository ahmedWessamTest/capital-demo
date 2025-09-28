import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertService } from '@core/shared/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

export const deSetPasswordGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const _PLATFORM_ID = inject(PLATFORM_ID);
  const isPassword = isPlatformBrowser(_PLATFORM_ID) && localStorage.getItem('isPassword');
  const _AlertService = inject(AlertService);
  const translate = inject(TranslateService);
  if(nextState.url.includes('set-password')) {
    return true;
  }
  if(isPassword === 'false') {
    translate.get('should_make_pass').subscribe((msg) => {
      _AlertService.showNotification({
      imagePath: '/common/unauth.webp',
      translationKeys: {
        title: msg,
      },
    });
    setTimeout(()=>{_AlertService.hide()},2000)
    })
    return false;
  }
  return true;
};
