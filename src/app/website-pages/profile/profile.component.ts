import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService, UserProfileData, UpdateProfilePayload } from '@core/services/profile/profile.service';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AlertService } from '@core/shared/alert/alert.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
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
export class ProfileComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _profileService = inject(ProfileService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  private _translateService = inject(TranslateService);
  currentLang$ = this._languageService.currentLanguage$;
  profileForm!: FormGroup;
  userData: UserProfileData | null = null;
  isLoading = signal(true);
  isSaving = signal(false);
  isDeactivating = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  shakeState = signal('idle');
  formSubmitted = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
  }

  initForm() {
    this.profileForm = this._fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      // gender: [''],
    });
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this._profileService.getUserData().subscribe({
      next: (response) => {
        this.userData = response.user;
        this.profileForm.patchValue({
          name: this.userData.name,
          email: this.userData.email,
          phone: this.userData.phone,
          // gender: this.userData.gender,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this._alertService.showNotification({
          title: this._translateService.instant('pages.profile.errors.load-failed'),
          message: this._translateService.instant('pages.profile.errors.load-failed'),
        });
        this.isLoading.set(false);
        this.triggerShakeAnimation();
      },
    });
  }

  onProfileSubmit(): void {
    this.formSubmitted.set(true);
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      this.errorMessage.set(this._translateService.instant('pages.profile.errors.form-invalid'));
      this.triggerShakeAnimation();
      this.clearMessagesAfterDelay();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UpdateProfilePayload = {
      name: this.profileForm.get('name')?.value,
      // gender: this.profileForm.get('gender')?.value,
    };

    this._profileService.updateProfile(payload).subscribe({
      next: (response) => {
        this.successMessage.set(this._translateService.instant('pages.profile.success.update'));
        this.isSaving.set(false);
        this.loadUserProfile();
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this._alertService.showNotification({
          title: this._translateService.instant('pages.profile.errors.update-failed'),
          message: this._translateService.instant('pages.profile.errors.update-failed'),
        });
        this.isSaving.set(false);
        this.triggerShakeAnimation();
        this.clearMessagesAfterDelay();
      },
    });
  }

  onDeactivateAccount(): void {
    if (confirm(this._translateService.instant('pages.profile.confirm-deactivate'))) {
      this.isDeactivating.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      this._profileService.deactivateUser({ deactive_status: 0 }).subscribe({
        next: (response) => {
          this.successMessage.set(this._translateService.instant('pages.profile.success.deactivate'));
          this.isDeactivating.set(false);
          this._authService.logout();
          let lang = '';
          this.currentLang$.subscribe((next) => (lang = next));
          this._router.navigate(['/', lang, 'login']);
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error deactivating account:', error);
          this._alertService.showNotification({
            title: this._translateService.instant('pages.profile.errors.deactivate-failed'),
            message: this._translateService.instant('pages.profile.errors.deactivate-failed'),
          });
          this.isDeactivating.set(false);
          this.triggerShakeAnimation();
          this.clearMessagesAfterDelay();
        },
      });
    }
  }

  onNameFocus() {
    this.profileForm.get('name')?.markAsTouched();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 5000);
  }
}