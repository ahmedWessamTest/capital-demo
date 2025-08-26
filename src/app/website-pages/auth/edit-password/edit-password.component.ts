import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '@core/services/profile/profile.service'; // Adjust path as needed
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule } from '@angular/common';
import { take } from 'rxjs'; // Import take operator

@Component({
  selector: 'app-edit-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-password.component.html',
  styleUrl: './edit-password.component.css',
  animations: [
    trigger('imageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('700ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('shake', [
      transition('idle => shake', [
        animate('50ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('50ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('skeletonAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }), // Slight translate for a subtle effect
        animate('500ms 300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })), // Delay to sync with skeleton fade-out
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
  ],
})
export class EditPasswordPageComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _profileService = inject(ProfileService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  private _translateService = inject(TranslateService);

  currentLang$ = this._languageService.currentLanguage$;
  passwordForm!: FormGroup;
  isUpdating = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal(true); // Added for skeleton loader
  shakeState = signal('idle');
  formSubmitted = signal(false); // Added for form validation state

  constructor() {
    this.passwordForm = this._fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Simulate data loading for skeleton effect
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000); // Adjust delay as needed
  }

  /**
   * Custom validator to check if new password and confirm password match.
   */
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Handles the submission of the password update form.
   */
  onPasswordSubmit(): void {
    this.formSubmitted.set(true); // Mark form as submitted
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      this.errorMessage.set(this._translateService.instant('pages.edit-password.errors.form-invalid'));
      this.triggerShakeAnimation();
      this.clearMessagesAfterDelay();
      return;
    }

    this.isUpdating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const newPassword = this.passwordForm.get('newPassword')?.value;

    this._profileService.updatePassword({ password: newPassword }).subscribe({
      next: (response) => {
        this.successMessage.set(this._translateService.instant('pages.edit-password.success.update'));
        this._alertService.showNotification({
          title: this._translateService.instant('pages.edit-password.success.update-title'),
          message: this._translateService.instant('pages.edit-password.success.update'),
        });
        this.isUpdating.set(false);
        this.clearMessagesAfterDelay();
        // Optionally navigate back to profile page after a short delay
        setTimeout(() => {
          let lang = '';
          this.currentLang$.pipe(take(1)).subscribe((next) => (lang = next));
          this._router.navigate(['/', lang, 'profile']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.errorMessage.set(error.error?.message || this._translateService.instant('pages.edit-password.errors.update-failed'));
        this._alertService.showNotification({
          title: this._translateService.instant('pages.edit-password.errors.update-failed-title'),
          message: error.error?.message || this._translateService.instant('pages.edit-password.errors.update-failed'),
        });
        this.isUpdating.set(false);
        this.triggerShakeAnimation();
        this.clearMessagesAfterDelay();
      },
    });
  }

  /**
   * Navigates back to the profile page.
   */
  goBackToProfile(): void {
    let lang = '';
    this.currentLang$.pipe(take(1)).subscribe((next) => (lang = next));
    this._router.navigate(['/', lang, 'profile']);
  }

  /**
   * Triggers the shake animation for form errors.
   */
  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }

  /**
   * Clears success/error messages after a delay.
   */
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 5000); // Clear messages after 5 seconds
  }
}
