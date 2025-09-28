import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

export const shouldSetPasswordGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const languageService = inject(LanguageService);
  const router = inject(Router);
  const platFormId = inject(PLATFORM_ID);
  const alertService = inject(AlertService);
  const translate = inject(TranslateService)
  if(isPlatformBrowser(platFormId)) {
    if (localStorage.getItem('isPassword') === "false" && authService.isAuthenticated()) {
      translate.get('should_make_pass').subscribe((msg) => {
  alertService.showNotification({
    imagePath: '/common/unauth.webp',
    translationKeys: {
      title: msg,
    },
  });
  setTimeout(()=>{
    alertService.hide();
  },2000);
});
      
      return languageService
      .currentLanguage$
      .pipe(map((lang) => router.createUrlTree(['/', lang, 'set-password'])));
    }
  }
  return true;
};
