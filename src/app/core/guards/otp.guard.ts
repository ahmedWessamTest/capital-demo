import { LanguageService } from './../services/language.service';
// src/app/core/guards/otp-time.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service'; // Assuming AuthService holds the timestamp
import { AlertService } from '../shared/alert/alert.service'; // For showing messages
import { TranslateService } from '@ngx-translate/core'; // Still needed if you use it elsewhere, but not for these specific messages now

@Injectable({
  providedIn: 'root',
})
export class OtpTimeGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private _translateService: TranslateService ,
    private languageService: LanguageService// Keeping it here, but direct usage for these messages is removed
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const otpVerifiedTimestamp = this.authService.getOtpVerifiedTime();
    const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
    let currentLang = '';
    this.languageService.currentLanguage$.subscribe((lang) => {
      console.log("lang",lang)
      currentLang = lang
    }); // Get the current language
console.log("currentLang",currentLang)
    // Define messages manually based on language
    const otpExpiredMessage_en = 'Your OTP verification has expired. Please request a new one.';
    const otpExpiredMessage_ar = 'لقد انتهت صلاحية التحقق من OTP الخاص بك. يرجى طلب رمز جديد.'; // Arabic translation

    const accessDeniedMessage_en = 'Access denied. Please verify your OTP first.';
    const accessDeniedMessage_ar = 'تم رفض الوصول. يرجى التحقق من رمز OTP الخاص بك أولاً.'; // Arabic translation

    if (otpVerifiedTimestamp) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - otpVerifiedTimestamp;

      if (timeElapsed <= threeMinutes) {
        // User is within the 3-minute window, allow access
        return true;
      } else {
        // More than 3 minutes have passed
        this.authService.clearOtpVerificationTime(); // Clear the timestamp as it's expired

        const messageToShow = currentLang === 'ar' ? otpExpiredMessage_ar : otpExpiredMessage_en;

        // this.alertService.showNotification({
        //   // Pass the message directly to the 'message' property
        //   message: messageToShow,
        // });
        // Redirect to the forgot password page or login page
        return this.router.createUrlTree(['/', currentLang, 'forgot-password']);
      }
    } else {
      // OTP verification timestamp not found (e.g., user tried to directly access, or session expired)
      const messageToShow = currentLang === 'ar' ? accessDeniedMessage_ar : accessDeniedMessage_en;

      // this.alertService.showNotification({
      //   // Pass the message directly to the 'message' property
      //   message: messageToShow,
      // });
      // Redirect to the forgot password page or login page
      return this.router.createUrlTree(['/', currentLang, 'forgot-password']);
    }
  }
}