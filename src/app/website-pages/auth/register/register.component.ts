import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService, AlertType } from '../../../core/shared/alert/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
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
export class RegisterComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  currentLang$ = this._languageService.currentLanguage$;
  registerForm!: FormGroup;
  isLoading = signal(false);
  shakeState = signal('idle');
  formSubmitted = signal(false);
  backendErrors = { email: '', phone: '' };

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.registerForm = this._fb.group({
      name: ['', [Validators.required]],
      email: [
        '',
        [
          Validators.required,
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^((\+20)|0)?1[0125][0-9]{8}$/)
        ],
      ],
    });
  }

  passwordMatchValidator(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.get(password);
      const confirmPasswordControl = formGroup.get(confirmPassword);

      if (confirmPasswordControl?.value && passwordControl?.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ mismatch: true });
      } else {
        confirmPasswordControl?.setErrors(null);
      }
    };
  }

  submition() {
    this.formSubmitted.set(true);
    this.backendErrors = { email: '', phone: '' };

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);

    const registerData = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      phone: this.registerForm.get('phone')?.value,
    };

    this._authService.register(registerData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.message === 'User Successfully Registered') {

          this._alertService.showNotification({
            imagePath: '/images/common/settings.webp',
            translationKeys: { title: 'Registration_successful' },
          });
          this.registerForm.reset();
          let lang = '';
          this.currentLang$.subscribe((next) => (lang = next));
          this._router.navigate(['/', lang, 'login']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        // if (error?.error?.errors) {
        //   if (error.error.errors.email) {
        //     this.backendErrors.email = error.error.errors.email[0];
        //   }
        //   if (error.error.errors.phone) {
        //     this.backendErrors.phone = error.error.errors.phone[0];
        //   }
        // } else {
          // this._alertService.showNotification({
          //   title: 'Registration Failed',
          //   message: error?.error?.message || 'Please check your input and try again.',
            
          //   translationKeys: {
          //     title: 'ERROR.REGISTRATION_FAILED',
          //     message: 'ERROR.REGISTRATION_MESSAGE',
          //   },
          //   onDismiss: () => console.log('Notification dismissed'),
          // });
          // this._alertService.showConfirmation({
          //   title: 'Registration Failed',
          //   message: 'Would you like to retry?',
          //   confirmText: 'Retry',
          //   cancelText: 'Cancel',
          //   translationKeys: {
          //     title: 'ERROR.REGISTRATION_FAILED',
          //     message: 'ERROR.RETRY_MESSAGE',
          //     confirmText: 'BUTTON.RETRY',
          //     cancelText: 'BUTTON.CANCEL',
          //   },
          //   onConfirm: () => console.log('Confirmed'),
          //   onCancel: () => console.log('Canceled'),
          //   onDismiss: () => console.log('Dismissed'),
          // });
          this._alertService.showOtp({
            title: 'Verify Your Email',
            message: 'Please enter the 6-digit code sent to your email.',
            email: 'user@example.com',
            translationKeys: {
              title: 'OTP.VERIFY_EMAIL',
              message: 'OTP.ENTER_CODE',
            },
            onVerify: (otp: string) => {
              console.log(`Verified OTP: ${otp}`);
              // Proceed with post-verification logic
            },
            onResend: () => {
              console.log('Resend OTP requested');
              // Additional resend logic
            },
            onCancel: () => {
              console.log('OTP verification canceled');
              // Cancel logic
            },
          });
          this.triggerShakeAnimation();
          // this.triggerShakeAnimation();
        // }
        this.triggerShakeAnimation();
      },
    });
  }

  onNameFocus() {
    this.registerForm.get('name')?.markAsTouched();
  }

  onEmailFocus() {
    this.registerForm.get('email')?.markAsTouched();
  }

  onPhoneFocus() {
    this.registerForm.get('phone')?.markAsTouched();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 400);
  }
}