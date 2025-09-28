
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService, AlertType, AlertConfig } from '../../../core/shared/alert/alert.service';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
  animations: [
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('inputAnimation', [
      transition(':enter', [
        query('input, label, div, .error-container', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(80, [animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
        ], { optional: true }),
      ]),
    ]),
    trigger('imageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('shake', [
      state('idle', style({ transform: 'translateX(0)' })),
      state('shake', style({ transform: 'translateX(0)' })),
      transition('idle => shake', [
        animate('50ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('50ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class ForgetPasswordComponent implements OnInit,OnDestroy {
  private destroy$ = new Subject<void>();
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  private _translateService = inject(TranslateService);

  currentLang$ = this._languageService.currentLanguage$;
  forgotPasswordForm!: FormGroup;
  isLoading = signal(false);
  shakeState = signal('idle');
  formSubmitted = signal(false);
  serverError = signal('');

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.forgotPasswordForm = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
    });
  }

  submition() {
    this.formSubmitted.set(true);
    this.serverError.set('');

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);

    const email = this.forgotPasswordForm.value.email;
    this._authService.sendOTp(email).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log(response.success);
        if (response.success && response.success.includes('Successfully')) {
          let lang = '';
          this.currentLang$.pipe(takeUntil(this.destroy$)).subscribe((next) => (lang = next));
          let title = this._translateService.instant('pages.auth.forgot-password.otp-title');
          let message = this._translateService.instant('pages.auth.forgot-password.otp-message');

          const alertConfigForOtp: AlertConfig = {
            message: message,
            email: email,
            alertType: AlertType.OTP,
            onVerify: (otp: string) => {
              this._authService.verifyOtp({ email, otp }).pipe(takeUntil(this.destroy$)).subscribe({
                next: (verifyResponse: any) => {
                  // Check if the response indicates success (either no error property or error says "Correct OTP")
                  if (!verifyResponse.error || verifyResponse.error === 'Correct OTP.') {
                    let currentLang = '';
                    this.currentLang$.pipe(takeUntil(this.destroy$)).subscribe((next) => (currentLang = next));
                    this._authService.storeResetEmail(email);
                    this._authService.storeResetOtp(otp);
                
                    // Hide the OTP alert BEFORE navigating
                    this._alertService.hide();
                
                    // Navigate to reset password page
                    this._router.navigate(['/', currentLang, 'reset-password'], {
                      state: {
                        alertConfig: {
                          type: AlertType.NOTIFICATION,
                          message: this._translateService.instant('pages.auth.success-message'),
                        }
                      }
                    });
                  } else {
                    // Handle incorrect OTP using AlertService
                    this._alertService.setVerificationResult(false, verifyResponse.error);
                  }
                },
                error: (error) => {
                  // Handle API errors using AlertService
                  const errorMessage = error?.error?.message || this._translateService.instant('Invalid_OTP');
                  this._alertService.setVerificationResult(false, errorMessage);
                },
              });
            },
            onResend: () => {
              this._authService.sendOTp(email).pipe(takeUntil(this.destroy$)).subscribe();
            },
          };

          this._alertService.showOtp(alertConfigForOtp);
        } else {
          this.serverError.set(response.error || 'Failed to send OTP. Please try again.');
          this.triggerShakeAnimation();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.serverError.set(error?.error?.message || 'Failed to send OTP. Please try again.');
        this.triggerShakeAnimation();
      },
    });
  }

  onEmailFocus() {
    this.forgotPasswordForm.get('email')?.markAsTouched();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete()
  }
}