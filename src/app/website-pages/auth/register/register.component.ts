import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  private _translate = inject(TranslateService)
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
            imagePath: './common/settings.webp',
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
        console.log(error);
        const backendErrors = error?.error?.errors || {};
        const errorMessages: string[] = [];
        const errorMapping: Record<string,string> = {
          email:"email_already",
          phone:"phone_already"
        }
       for (const key in errorMapping) {
        if(backendErrors[key]) {
          errorMessages.push(this._translate.instant(errorMapping[key]));
        }
       }        
        if(errorMessages.length === 0) {
          errorMessages.push(this._translate.instant("something_went_wrong"))
        }
        this._alertService.showNotification({
            translationKeys: { title: 'register_filed' },
            messages: errorMessages
          });
        this.triggerShakeAnimation();
        // this.triggerShakeAnimation();
        // }
        this.triggerShakeAnimation();
      },
      complete: () => {
        setTimeout(() => {
          this._alertService.hide();
        }, 2000);
      }
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
