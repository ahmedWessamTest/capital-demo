import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GovernorateOption } from '@core/shared/policy-drop-down/policy-drop-down.component';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthStorageService, UserData } from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { Router } from '@angular/router';
import { MedicalInsurance, MedicalCategory, MedicalInsuranceService, MedicalPolicyData } from '@core/services/policies/medical-policy.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { Meta, Title } from '@angular/platform-browser';
@Component({
  selector: 'app-medical-individual-form',
  imports: [
    CommonModule,
        ReactiveFormsModule,
        CarouselModule,
        TranslateModule,
        CustomTranslatePipe,
  ],
  templateUrl: './medical-individual-form.component.html',
  styleUrl: './medical-individual-form.component.css'
})
export class MedicalIndividualFormComponent {
claimForm: FormGroup;
  showForm = false;
  step = 0;
  progress = 20;
  selectedPlan: MedicalInsurance | null = null;
  leadId: number | null = null;
  isLoading = false; // Updated to false initially
  isNeedCallLoading = false;
  showPlans = false;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
  private platformId = inject(PLATFORM_ID);
  plans: MedicalInsurance[] = [];
  genders: GovernorateOption[] = [
    { id: 'male', name: 'Male', code: 'MALE', en_name: 'Male', ar_name: 'ذكر' },
    { id: 'female', name: 'Female', code: 'FEMALE', en_name: 'Female', ar_name: 'أنثى' }
  ];
  category: MedicalCategory | null = null;

  steps = [
    { en_title: 'Personal Information', ar_title: 'المعلومات الشخصية', formFields: ['name', 'phone', 'email'] },
    { en_title: 'Birthdate', ar_title: 'تاريخ الميلاد', formFields: ['birthdate'] },
    { en_title: 'Gender', ar_title: 'الجنس', formFields: ['gender'] },
    { en_title: 'Select Plan', ar_title: 'اختيار الخطة', formFields: [] },
    { en_title: 'Payment', ar_title: 'الدفع', formFields: ['paymentType', 'paymentMethod'] }
  ];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    smartSpeed: 700,
    navText: ['<', '>'],
    nav: false,
    center: true,
    autoplay: true,
    margin: 16,
    responsive: {
      0: { items: 1, nav: false },
      400: { items: 1, nav: false },
      600: { items: 2, nav: false },
      1000: { items: 3, nav: false }
    }
  }
  today: string;
  currentLanguage: string = 'en';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authStorage: AuthStorageService,
    private medicalInsuranceService: MedicalInsuranceService,
    public translate: TranslateService,
    public languageService: LanguageService,
    private alertService: AlertService,
    private genericDataService: UpdatedGenericDataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title
  ) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      paymentType: ['Full Payment', Validators.required],
      paymentMethod: ['Cash', Validators.required],
      needCall: ['No']
    });
    this.today = new Date().toISOString().split('T')[0];

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.cdr.markForCheck()
      this.updateCarouselDirection(lang);

      this.currentLanguage = lang;
      
    });

    this.alertSubscription = this.alertService.showAlert$.subscribe(show => {
      if (!show && this.step === 3) {
        this.showPlans = true;
      }
    });
  }


  ngOnInit(): void {
    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      const userData: UserData | null = this.authService.getUserData();
      if (userData) {
        this.claimForm.patchValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone
        });
        this.claimForm.get('name')?.disable();
        this.claimForm.get('phone')?.disable();
        this.claimForm.get('email')?.disable();
      }
    }

    this.medicalInsuranceService.fetchMedicalData().pipe(
      tap(data => {
        this.category = data.category;
        this.plans = this.medicalInsuranceService.getActiveInsurances();
        this.cdr.markForCheck()

        const metaTitle = this.translate.currentLang === 'ar' ? data.category.ar_meta_title : data.category.en_meta_title;
        const metaDescription = this.translate.currentLang === 'ar' ? data.category.ar_meta_description : data.category.en_meta_description;
        this.title.setTitle(metaTitle);
        this.meta.updateTag({ name: 'description', content: metaDescription });
        this.cdr.markForCheck();
      }),
      catchError(err => {
        console.error('Error fetching medical data:', err);
        this.alertService.showNotification({
          translationKeys: { message: 'pages.medical_policy.errors.data_fetch_failed' }
        });
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
  }

  onImageLoad(): void {
    this.cdr.markForCheck();
  }

  onImageError(): void {
    this.alertService.showNotification({
      translationKeys: { message: 'pages.medical_policy.errors.image_load_failed' }
    });
    this.cdr.markForCheck();
  }


  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
  }

  private updateCarouselDirection(lang: string): void {
    const isRtl = lang === 'ar';
    if (this.customOptions.rtl !== isRtl) {
      this.customOptions = { 
        ...this.customOptions, 
        rtl: isRtl,
        navText: isRtl ? ['التالي', 'السابق'] : ['Previous', 'Next']
      };
    }
  }

  onGenderSelected(gender: GovernorateOption) {
    this.claimForm.get('gender')?.setValue(gender ? gender.id : '');
    this.claimForm.get('gender')?.markAsTouched();
  }

  onPlanSelected(plan: MedicalInsurance) {
    this.selectedPlan = plan;
    this.step++;
    this.progress = 100;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const fields = [
      { key: 'name', value: this.claimForm.get('name')?.value, include: this.step >= 0 },
      { key: 'phone', value: this.claimForm.get('phone')?.value, include: this.step >= 0 },
      { key: 'email', value: this.claimForm.get('email')?.value, include: this.step >= 0 },
      { key: 'birthdate', value: this.claimForm.get('birthdate')?.value, include: this.step >= 1 },
      { key: 'gender', value: this.claimForm.get('gender')?.value, include: this.step >= 2 },
      { key: 'need_call', value: this.claimForm.get('needCall')?.value || 'No', include: this.step >= 1 }
    ];

    fields.forEach(field => {
      if (field.include && field.value) {
        formData.append(field.key, field.value);
      }
    });

    return formData;
  }

  needCall() {
    this.isNeedCallLoading = true;
    this.claimForm.get('needCall')?.setValue('Yes');
    const formData = this.createFormData();
    const lang = this.translate.currentLang || 'en';
    if (this.leadId) {
      this.medicalInsuranceService.updateMedicalLead(this.leadId, formData).pipe(
        tap(() => {
          let messages = [
            this.translate.instant('pages.medical_policy.alerts.call_request_success'),
            this.translate.instant('pages.medical_policy.alerts.call_request_contact'),
            this.translate.instant('pages.medical_policy.alerts.call_request_thanks')
          ];
          this.alertService.showCallRequest({
            messages,
            buttonLabel: this.translate.instant('pages.medical_policy.alerts.back_button'),
          });
        }),
        catchError(err => {
          console.error('Error updating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.medical_policy.errors.lead_update_failed' }
          });
          return of(null);
        }),
        tap(() => this.isNeedCallLoading = false)
      ).subscribe();
    } else {
      this.medicalInsuranceService.createMedicalLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          let buttonLabel = this.translate.instant('pages.medical_policy.alerts.back_button');
          this.alertService.showCallRequest({
            messages: [
              this.translate.instant('pages.medical_policy.alerts.call_request_success'),
              this.translate.instant('pages.medical_policy.alerts.call_request_contact'),
              this.translate.instant('pages.medical_policy.alerts.call_request_thanks')
            ],
            buttonLabel: buttonLabel,
            redirectRoute: `/${lang}/home`
          });
        }),
        catchError(err => {
          console.error('Error creating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.medical_policy.errors.lead_creation_failed' }
          });
          return of(null);
        }),
        tap(() => this.isNeedCallLoading = false)
      ).subscribe();
    }
  }

  nextStep() {
    const currentStepFields = this.steps[this.step].formFields;
    currentStepFields.forEach(field => {
      const control = this.claimForm.get(field);
      if (control && !control.disabled) {
        control.markAsTouched();
      }
    });
  
    const isStepValid = currentStepFields.every(field => {
      const control = this.claimForm.get(field);
      return control?.disabled || control?.valid;
    });
  
    if (!isStepValid) {
      return;
    }
  
    if (this.isLoading) return;
    this.isLoading = true;
  
    if (this.step === 0 && !this.authService.isAuthenticated()) {
      const formData = this.claimForm.value;
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: 'defaultPassword123'
      };
  
      this.authService.register(registerData).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          let errorMessage = this.translate.instant('pages.home_form.errors.registration_failed');
  
          if ((error.status === 422 || error.status === 400) && error.error?.errors) {
            if (error.error.errors.email) {
              errorMessage += `\n- ${this.translate.instant('pages.home_form.errors.email_exist')}`;
            }
            if (error.error.errors.phone) {
              errorMessage += `\n- ${this.translate.instant('pages.home_form.errors.phone_exist')}`;
            }
            this.alertService.showGeneral({
              messages: [errorMessage + '\n' ],
              buttonLabel: this.translate.instant('pages.home_form.errors.login'),
              redirectRoute: `/${this.authService.getCurrentLang()}/login`
            });
          } else {
            alert(this.translate.instant('pages.home_form.errors.unexpected_error'));
          }
          return new Observable(observer => observer.error(error));
        }),
        tap((response: any) => {
          console.log('User registered successfully:', response);
          this.authStorage.saveUserData(response.user);
        })
      ).subscribe({
        next: () => {
          this.proceedWithNextStep();
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.proceedWithNextStep();
    }
  }
  private proceedWithNextStep() {
    const formData = this.createFormData();
    if (this.step === 0 || !this.leadId) {
      this.medicalInsuranceService.createMedicalLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          this.step++;
          this.progress = (this.step + 1) * 20;
          if (this.step === 3) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [
                this.translate.instant('pages.medical_policy.alerts.building_request'),
                this.translate.instant('pages.medical_policy.alerts.building_request_contact'),
                this.translate.instant('pages.medical_policy.alerts.building_request_thanks')
              ],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => {
          console.error('Error creating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.medical_policy.errors.lead_creation_failed' }
          });
          return of(null);
        })
      ).subscribe({complete:()=>{
        this.isLoading = false;
        setTimeout(()=>{
          this.alertService.hide();
        },1000)
      }});
    } else {
      this.medicalInsuranceService.updateMedicalLead(this.leadId, formData).pipe(
        tap(() => {
          this.step++;
          this.progress = (this.step + 1) * 20;
          if (this.step === 3) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [this.translate.instant('pages.medical_policy.alerts.building_request')],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => { 
          console.error('Error updating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.medical_policy.errors.lead_update_failed' }
          });
          return of(null);
        })
      ).subscribe({
        complete:()=>{
          this.isLoading = false;
          setTimeout(()=>{
            this.alertService.hide();
          },1000)
        }
      });
    }
  }
  
  pay() {
    this.proceedWithPayment();
  }
  
  private proceedWithPayment() {
    const policyData: MedicalPolicyData = {
      category_id: String(this.category!.id),
      user_id: this.authService.getUserId() || '0',
      medical_insurance_id: String(this.selectedPlan!.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      active_status: 'requested',
      payment_method: 'Cash',
      birthdate: this.claimForm.get('birthdate')?.value,
      gender: this.claimForm.get('gender')?.value
    };
  
    const lang = this.translate.currentLang || 'en';
    this.medicalInsuranceService.submitMedicalPolicy(policyData).pipe(
      tap(response => {
        console.log('Policy submitted:', response);
        this.alertService.showGeneral({
          messages: [
            this.translate.instant('pages.medical_policy.alerts.policy_submitted'),
            this.translate.instant('pages.medical_policy.alerts.policy_review'),
            `${this.translate.instant('pages.medical_policy.alerts.request_code')} ${response.data.id}`
          ],
          buttonLabel: this.translate.instant('pages.medical_policy.alerts.back_button'),
          redirectRoute: `/${lang}/home`
        });
        this.claimForm.reset();
        this.step = 0;
        this.plans = [];
        this.category = null;
        this.progress = 20;
        this.selectedPlan = null;
        this.leadId = null;
        this.router.navigate(['/', lang, 'home']);
      }),
      catchError(err => {
        console.error('Error submitting policy:', err);
        this.alertService.showNotification({
          translationKeys: { message: this.translate.instant('pages.medical_policy.errors.policy_submission_failed') }
        });
        return of(null);
      }),
      tap(() => this.isLoading = false)
    ).subscribe();
  }

  isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  isNumber(str: string): boolean {
    return !isNaN(Number(str)) && str.trim() !== '';
  }

  preventPaste(event: Event): void {
    event.preventDefault();
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

  prev(): void {
    this.owlCarousel.prev();
  }

  next(): void {
    this.owlCarousel.next();
  }

  @ViewChildren('planCard') planCards!: QueryList<ElementRef>;

  ngAfterViewInit() {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
      const elements = document.querySelectorAll<HTMLElement>('.plan-card');
      let maxHeight = 0;

      elements.forEach(el => {
        el.style.height = 'auto';
        const height = el.offsetHeight;
        if (height > maxHeight) {
          maxHeight = height;
        }
      });

      elements.forEach(el => {
        el.style.height = `${maxHeight}px`;
      });
    }
    }, 100);
  }

  RestirctToNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Remove any numbers from the input value
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (value !== filteredValue) {
      input.value = filteredValue;
      this.claimForm.get('phone')?.setValue(filteredValue);
    }
  }
  restrictToLetters(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Remove any numbers from the input value
    const filteredValue = value.replace(/[0-9]/g, '');
    if (value !== filteredValue) {
      input.value = filteredValue;
      this.claimForm.get('fullName')?.setValue(filteredValue); // Changed 'name' to 'fullName'
    }
  }
}
