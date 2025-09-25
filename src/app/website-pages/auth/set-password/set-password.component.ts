import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService } from '../../../core/shared/alert/alert.service';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-set-password',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.css',
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
export class SetPasswordComponent {
private destroy$ = new Subject<void>();
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
   _translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID)
  currentLang$ = this._languageService.currentLanguage$;
  setPassForm!: FormGroup;
  isLoading = signal(false);
  isChecked = signal(false);
  shakeState = signal('idle');
  formSubmitted = signal(false);

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.setPassForm = this._fb.group({ 
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
        
      ],
      rePassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ]
    },{ validators: this.passwordMatchValidator });
  }
loggedInSuccessfully(response:any):void {
this.isLoading.set(false);
        let lang = '';
        this.currentLang$.pipe(takeUntil(this.destroy$)).subscribe((next) => (lang = next));
        if (response.success) {
          this._alertService.showNotification({
            translationKeys: { title: 'Login_successful' },
          });
          this.setPassForm.reset();
           if(isPlatformBrowser(this._PLATFORM_ID)){
            localStorage.setItem('isPassword',"true");
           }
    this._router.navigate(['/', lang, 'home']);
        } else {
          this.triggerShakeAnimation();
        }
}
loginSuccessfully(error:any):void {
this.isLoading.set(false);
        this._alertService.showNotification({
          translationKeys: { title: this._translate.instant("Login_failed") },
        });
        this.triggerShakeAnimation();
}
passwordMatchValidator(group: FormGroup) {
  const password = group.get('password')?.value;
  const rePassword = group.get('rePassword')?.value;
  return password === rePassword ? null : { passwordMismatch: true };
}
  submission() {
    console.log(this.setPassForm);
    
    this.formSubmitted.set(true);
    if (this.setPassForm.invalid) {
      this.setPassForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);
    this._authService.setPassword(this.setPassForm.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loggedInSuccessfully(response);
      },
      error: (error) => {
        this.loginSuccessfully(error);
      },
      complete: () => {
        setTimeout(() => {
          this._alertService.hide();
        }, 2000)
      }
    });
  }

  onPasswordFocus() {
    this.setPassForm.get('password')?.markAsTouched();
  }

  triggerShakeAnimation() {
    this.shakeState.set('shake');
    setTimeout(() => {
      this.shakeState.set('idle');
    }, 500);
  }
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }
}
