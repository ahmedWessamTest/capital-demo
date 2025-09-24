import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AlertService } from '../../../core/shared/alert/alert.service';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, CommonModule, isPlatformBrowser, NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, AsyncPipe, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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
export class LoginComponent implements OnInit,OnDestroy {
  private destroy$ = new Subject<void>();
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private _alertService = inject(AlertService);
  private _translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  currentLang$ = this._languageService.currentLanguage$;
  loginForm!: FormGroup;
  isLoading = signal(false);
  isChecked = signal(false);
  shakeState = signal('idle');
  formSubmitted = signal(false);

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)|(^(\+2|0)(10|12|15)\d{8}$)/
          ),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });
  }
loggedInSuccessfully(response:any):void {
  
  console.log(response);
  
this.isLoading.set(false);
        let lang = '';
        this.currentLang$.pipe(takeUntil(this.destroy$)).subscribe((next) => (lang = next));
        if (response.access_token) {
          this._alertService.showNotification({
            translationKeys: { title: 'Login_successful' },
          });
          this.loginForm.reset();
          
          if(response.password === "") {
    this._router.navigate(['/',lang,'set-password']);
  }else {
    this._router.navigate(['/', lang, 'home']);
  }
  if(isPlatformBrowser(this._PLATFORM_ID)){
          localStorage.setItem('isPassword', response.password === "" ? "false" : "true");
  }
        } else {
          if (!response?.error?.includes("Deleted")) {
            this._alertService.showNotification({
              translationKeys: { title: 'register_filed' },
            });
          } else {
            this._alertService.showNotification({
              translationKeys: { title: 'account_deleted' },
            });
          }
          this.triggerShakeAnimation();
        }
}
loginSuccessfully(error:any):void {
this.isLoading.set(false);
        const errorMessage =  'Login failed. Please try again.';
        this._alertService.showNotification({
          translationKeys: { title: this._translate.instant("Login_failed") },
        });
        this.triggerShakeAnimation();
}
  submition() {
    this.formSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isLoading.set(true);
    this._authService.login(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe({
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
loginWithGoogle() {
  this._authService.signInWithGoogle().pipe(takeUntil(this.destroy$)).subscribe(
    {
      next:(response:any)=>{
      this.loggedInSuccessfully(response);
    },
  error:(error)=>{
this.loginSuccessfully(error);
  },
  complete: () => {
        setTimeout(() => {
          this._alertService.hide();
        }, 2000)
      }
}
  )
}
  toggleCheckbox() {
    this.isChecked.set(!this.isChecked());
  }

  onLoginInputFocus() {
    this.loginForm.get('loginInput')?.markAsTouched();
  }

  onPasswordFocus() {
    this.loginForm.get('password')?.markAsTouched();
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
