import { animate, state, style, transition, trigger, keyframes } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, Subscription, interval } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { AlertService, AlertType } from './alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  animations: [
    trigger('fadeAnimation', [
      state('hidden', style({ opacity: 0, visibility: 'hidden' })),
      state('visible', style({ opacity: 1, visibility: 'visible' })),
      transition('hidden => visible', [animate('250ms ease-out')]),
      transition('visible => hidden', [animate('200ms ease-in')]),
    ]),
    trigger('slideAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(-30px)', visibility: 'hidden' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)', visibility: 'visible' })),
      transition('hidden => visible', [animate('300ms ease-out')]),
      transition('visible => hidden', [animate('250ms ease-in')]),
    ]),
    trigger('shakeAnimation', [
      state('shake', style({ transform: 'translateX(0)' })),
      transition('* => shake', [
        animate(
          '400ms ease-in-out',
          keyframes([
            style({ transform: 'translateX(0)', offset: 0 }),
            style({ transform: 'translateX(-10px)', offset: 0.2 }),
            style({ transform: 'translateX(10px)', offset: 0.4 }),
            style({ transform: 'translateX(-10px)', offset: 0.6 }),
            style({ transform: 'translateX(10px)', offset: 0.8 }),
            style({ transform: 'translateX(0)', offset: 1.0 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class AlertComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  private autoCloseTimer: any;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  _alertService = inject(AlertService);
  _translateService = inject(TranslateService);
  _elementRef = inject(ElementRef);
  _router = inject(Router);

  showAlert$ = this._alertService.showAlert$;
  alertConfig$ = this._alertService.alertConfig$;
  AlertType = AlertType;

  otpDigits: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';
  shakeState: string = '';
  isVerifying = signal(false);
  resendTimer = signal(0);
  canResend = signal(false);

  isOtpType(): boolean {
    let isOtp = false;
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      isOtp = config?.alertType === AlertType.OTP;
    });
    return isOtp;
  }

  isNotificationType(): boolean {
    let isNotification = false;
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      isNotification = config?.alertType === AlertType.NOTIFICATION;
    });
    return isNotification;
  }

  isCallRequestType(): boolean {
    let isCallRequest = false;
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      isCallRequest = config?.alertType === AlertType.CALL_REQUEST;
    });
    return isCallRequest;
  }

  isGeneralType(): boolean {
    let isGeneral = false;
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      isGeneral = config?.alertType === AlertType.GENERAL;
    });
    return isGeneral;
  }

  handleAlertClick(event: MouseEvent): void {
    if (this.isNotificationType()) {
      event.stopPropagation();
      this._alertService.hide();
    }
  }

  translatedTitle$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.title
        ? this._translateService.instant(config.translationKeys.title)
        : config.title || '';
    })
  );

  translatedMessages$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config || !config.messages) return [];
      return config.messages.map((msg, index) =>
        config.translationKeys?.message?.[index]
          ? this._translateService.instant(config.translationKeys.message[index])
          : msg
      );
    })
  );

  translatedButtonLabel$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.buttonLabel
        ? this._translateService.instant(config.translationKeys.buttonLabel)
        : config.buttonLabel || '';
    })
  );

  translatedConfirmText$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.confirmText
        ? this._translateService.instant(config.translationKeys.confirmText)
        : config.confirmText || '';
    })
  );

  translatedCancelText$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config) return '';
      return config.translationKeys?.cancelText
        ? this._translateService.instant(config.translationKeys.cancelText)
        : config.cancelText || '';
    })
  );

  translatedEmail$ = this.alertConfig$.pipe(
    map((config) => {
      if (!config?.email) return '';
      const [name, domain] = config.email.split('@');
      const maskedName = name.slice(0, 2) + '**';
      return `${maskedName}@${domain}`;
    })
  );

  @HostBinding('class.visible')
  get isVisible() {
    return this._alertService.showAlertSubject$.getValue();
  }

  // ngOnInit(): void {
  //   this.showAlert$.pipe(takeUntil(this.destroyed$)).subscribe((visible) => {
  //     if (!this.isBrowser) return;

  //     if (visible) {
  //       setTimeout(() => {
  //         const alertElement = this._elementRef.nativeElement.querySelector('.alert-wrapper');
  //         if (alertElement) {
  //           alertElement.focus();
  //           this.trapFocus(alertElement);
  //         }
  //       }, 100);

  //       if (typeof document !== 'undefined') {
  //         document.body.style.overflow = 'hidden';
  //       }

  //       this.setAutoCloseTimerIfNeeded();
  //       if (this.isOtpType()) {
  //         this.startResendTimer();
  //         this.otpDigits = ['', '', '', '', '', ''];
  //         this.errorMessage = '';
  //       }
  //     } else {
  //       if (typeof document !== 'undefined') {
  //         document.body.style.overflow = '';
  //       }

  //       this.clearAutoCloseTimer();
  //       this.resendTimer.set(0);
  //       this.canResend.set(true);
  //       this.otpDigits = ['', '', '', '', '', ''];
  //       this.errorMessage = '';
  //     }
  //   });
  // }
// In AlertComponent - Add this to the ngOnInit method where you handle showAlert$ subscription
ngOnInit(): void {
  this.showAlert$.pipe(takeUntil(this.destroyed$)).subscribe((visible) => {
    // ... your existing code ...
    
    if (visible) {
      // ... existing code ...
      if (this.isOtpType()) {
        this.startResendTimer();
        this.otpDigits = ['', '', '', '', '', ''];
        this.errorMessage = '';
        // ADD THIS LINE:
        this.isVerifying.set(false);
      }
    } else {
      // ... existing code ...
      this.otpDigits = ['', '', '', '', '', ''];
      this.errorMessage = '';
      // ADD THIS LINE:
      this.isVerifying.set(false);
    }
  });

  // ADD THIS ENTIRE SUBSCRIPTION:
  this._alertService.verificationResult$.pipe(takeUntil(this.destroyed$)).subscribe(result => {
    if (!result.success) {
      this.errorMessage = result.errorMessage || this._translateService.instant('Invalid_OTP');
      this.otpDigits = ['', '', '', '', '', ''];
      this.isVerifying.set(false);
      this.triggerShakeAnimation();
    }
  });
}
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    this.clearAutoCloseTimer();
  }

  private timerSub?: Subscription;

private startResendTimer(): void {
  const duration = 60;
  this.resendTimer.set(duration);
  this.canResend.set(false);

  // لو فيه تايمر شغال قبل كده، نقفله
  this.timerSub?.unsubscribe();

  this.timerSub = interval(1000).pipe(take(duration)).subscribe(() => {
    this.resendTimer.update((time) => {
      if (time <= 1) {
        this.canResend.set(true);
        this.timerSub?.unsubscribe(); // نوقف التايمر لما يخلص
        return 0;
      }
      return time - 1;
    });
  });
}



  private setAutoCloseTimerIfNeeded(): void {
    this.clearAutoCloseTimer();

    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.alertType === AlertType.NOTIFICATION || config?.alertType === AlertType.CALL_REQUEST || config?.alertType === AlertType.GENERAL) {
        this.autoCloseTimer = setTimeout(() => {
          this._alertService.hide();
        }, 2000);
      }
    });
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }

  private trapFocus(element: HTMLElement): void {
    if (!this.isBrowser) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const otpInputs = Array.from(element.querySelectorAll('input[id^="otp-digit-"]')) as HTMLElement[];

    if (focusableElements.length) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      firstElement.focus();

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        } else if (this.isOtpType() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          const activeElement = document.activeElement as HTMLElement;
          const currentIndex = otpInputs.indexOf(activeElement);

          if (currentIndex !== -1) {
            if (e.key === 'ArrowLeft') {
              if (currentIndex > 0) {
                otpInputs[currentIndex - 1].focus();
                e.preventDefault();
              }
            } else if (e.key === 'ArrowRight') {
              if (currentIndex < otpInputs.length - 1) {
                otpInputs[currentIndex + 1].focus();
                e.preventDefault();
              }
            }
          }
        }
      });
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (!this.isBrowser) return;

    if (this.isVisible) {
      this.handleOutsideAction();
      event.preventDefault();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.alertType === AlertType.NOTIFICATION) {
        this._alertService.hide();
      } else if (event.target === event.currentTarget) {
        this.handleOutsideAction();
      }
    });
  }

  private handleOutsideAction(): void {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.alertType === AlertType.NOTIFICATION) {
        this._alertService.hide();
      } else {
        if (config?.onCancel) {
          config.onCancel();
        }
        this._alertService.hide();
      }
    });
  }

  onConfirm() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onConfirm) {
        config.onConfirm();
      }
      this._alertService.hide();
    });
  }

  onCancel() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.onCancel) {
        config.onCancel();
      }
      this._alertService.hide();
    });
  }

  onButtonClick() {
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      if (config?.redirectRoute) {
        this._router.navigateByUrl(config.redirectRoute);
      }
      this._alertService.hide();
    });
  }

  // onVerify() {
  //   const otp = this.otpDigits.join('');
  //   if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
  //     this.errorMessage = this._translateService.instant('Invalid_OTP');
  //     this.otpDigits = ['', '', '', '', '', ''];
  //     this.isVerifying.set(false);
  //     this.triggerShakeAnimation();
  //     return;
  //   }

  //   this.isVerifying.set(true);

  //   this.alertConfig$.pipe(take(1)).subscribe((config) => {
  //     if (config?.onVerify) {
  //       config.onVerify(otp);
  //     } else {
  //       this.isVerifying.set(false);
  //     }
  //   });
  // }
// In AlertComponent - Update the onVerify method to handle errors better

onVerify() {
  const otp = this.otpDigits.join('');
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    this.errorMessage = this._translateService.instant('Invalid_OTP');
    this.otpDigits = ['', '', '', '', '', ''];
    this.isVerifying.set(false);
    this.triggerShakeAnimation();
    return;
  }

  this.isVerifying.set(true);

  this.alertConfig$.pipe(take(1)).subscribe((config) => {
    if (config?.onVerify) {
      // FIX: Wrap the onVerify call to handle errors properly
      try {
        config.onVerify(otp);
      } catch (error) {
        // If onVerify throws an error, reset the loading state
        this.errorMessage = this._translateService.instant('Invalid_OTP');
        this.otpDigits = ['', '', '', '', '', ''];
        this.isVerifying.set(false);
        this.triggerShakeAnimation();
      }
      
      // FIX: Add a timeout to reset loading state if verification takes too long or fails
      setTimeout(() => {
        // Only reset if we're still in loading state (verification didn't succeed)
        if (this.isVerifying()) {
          this.isVerifying.set(false);
        }
      }, 5000); // 10 second timeout
      
    } else {
      this.isVerifying.set(false);
    }
  });
}
  onResend() {
    if (!this.canResend()) return;

    this.errorMessage = '';
    this.otpDigits = ['', '', '', '', '', ''];
    this.isVerifying.set(false);

    this.startResendTimer();
    this.canResend.set(false);
    this.alertConfig$.pipe(take(1)).subscribe((config) => {
      console.log("resend config:",config);
      if (config?.onResend) {
        Promise.resolve().then(()=> config.onResend?.())
      }
    });
  }

  triggerShakeAnimation(): void {
    this.shakeState = 'shake';
    setTimeout(() => {
      this.shakeState = '';
    }, 400);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otpDigits[index] = '';
      return;
    }

    if (value.length > 1) {
      input.value = value.slice(0, 1);
      this.otpDigits[index] = value.slice(0, 1);
    } else {
      this.otpDigits[index] = value;
    }

    if (value && index < 5) {
      const nextInput = this._elementRef.nativeElement.querySelector(`#otp-digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onBackspace(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '' && index > 0) {
      const prevInput = this._elementRef.nativeElement.querySelector(`#otp-digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    if (/^\d{6}$/.test(pastedData)) {
      this.otpDigits = pastedData.split('').slice(0, 6);
      const lastInput = this._elementRef.nativeElement.querySelector(`#otp-digit-5`);
      if (lastInput) {
        lastInput.focus();
      }
    }
  }
}