import { finalize } from 'rxjs/operators';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService } from '../../../core/shared/alert/alert.service';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
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
export class ResetPasswordComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  currentLang$ = this._languageService.currentLanguage$;
  resetForm!: FormGroup;
  isLoading = signal(false);
  shakeState = signal('idle');
  formSubmitted = signal(false);
  email: string = '';

  ngOnInit(): void {
    this.email = this._authService.getResetEmail() || '';
    this.initForm();
  }

  initForm() {
    this.resetForm = this._fb.group({
      email: [
        { value: this.email, disabled: true },
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ],
      ],
      password_confirmation: [
        '',
        [
          Validators.required,
        ],
      ],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null
      : { mismatch: true };
  }

  submition() {
    this.formSubmitted.set(true);

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);

    this._authService.resetPassword(this.resetForm.getRawValue()).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        let lang = '';
        this.currentLang$.subscribe((next) => (lang = next));
        this._alertService.showNotification({
          imagePath: './common/settings.webp',
          translationKeys: { title: 'Reset_password_successful' },
        });
        this._authService.clearResetEmail();
        this.resetForm.reset();
        this._router.navigate(['/', lang, 'login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error?.error?.message || 'Reset password failed. Please try again.';
        this._alertService.showNotification({
          imagePath: './common/before-remove.webp',
          translationKeys: { title: errorMessage },
        });
        this.triggerShakeAnimation();
      },
      complete: () => {
        setTimeout(() => {
          this._alertService.hide();
        }, 1000)
      }
    });
  }

  onPasswordFocus() {
    this.resetForm.get('password')?.markAsTouched();
  }

  onConfirmPasswordFocus() {
    this.resetForm.get('password_confirmation')?.markAsTouched();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }
}
