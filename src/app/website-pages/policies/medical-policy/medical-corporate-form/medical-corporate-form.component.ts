import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ViewChild, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GovernorateOption, PolicyDropDownComponent } from '@core/shared/policy-drop-down/policy-drop-down.component';
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
import { MedicalInsurance, MedicalCategory, MedicalInsuranceService, MedicalPolicyData, MedicalPolicyCorporateData } from '@core/services/policies/medical-policy.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { Meta, Title } from '@angular/platform-browser';
import { formDataToObject } from '@core/utils/form-utils';
@Component({
  selector: 'app-medical-corporate-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CarouselModule,
    TranslateModule,
    CustomTranslatePipe,
    PolicyDropDownComponent
  ],
  templateUrl: './medical-corporate-form.component.html',
  styleUrl: './medical-corporate-form.component.css'
})
export class MedicalCorporateFormComponent {
  userDataStatus:Record<string, boolean> = {
name: false,
email: false,
    phone: false,
  };
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
  avgAgeOptions: GovernorateOption[] = [
    {
      id: 1,
      name: '20-24',
      code: '20-24',
      en_name: '20-24',
    },
    {
      id: 2,
      name: '25-29',
      code: '25-29',
      en_name: '25-29',
    },
    {
      id: 3,
      name: '30-34',
      code: '30-34',
      en_name: '30-34',
    },
    {
      id: 4,
      name: '35-39',
      code: '35-39',
      en_name: '35-39',
    },
    {
      id: 5,
      name: '40-49',
      code: '40-49',
      en_name: '40-49',
    },
    {
      id: 6,
      name: '50+',
      code: '50+',
      en_name: '50+',
    },
  ];
  category: MedicalCategory | null = null;

  steps = [
    { en_title: 'Personal Information', ar_title: 'المعلومات الشخصية', formFields: ['name', 'phone', 'email'] },
    {
      en_title: 'company name',
      ar_title: 'اسم الشركه',
      formFields: ['company_name'],
    },
    {
      en_title: 'company location',
      ar_title: 'موقع الشركه',
      formFields: ['company_address'],
    },
    {
      en_title: 'number of employees',
      ar_title: 'عدد الموظفين',
      formFields: ['company_employee_number'],
    },
    {
      en_title: 'Average age',
      ar_title: 'متوسط العمر',
      formFields: ['company_employee_avg'],
    },
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
    private router: Router,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title
  ) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      company_name: ['', Validators.required],
      company_employee_number: ['', [Validators.required, Validators.min(1)]],
      company_employee_avg: ['', [Validators.required]],
      company_address: ['', Validators.required],

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
      if (!show && this.step === 5) {
        this.showPlans = true;
      }
    });
  }

fillUserData(userData: UserData | null):void {
if(userData) {
        const {name, email, phone} = userData as UserData;
        this.claimForm.patchValue({name, email, phone});

        const fields = ['name', 'email', 'phone'] as const;
this.userDataStatus = {
    name: !!userData.name,
    email: !!userData.email,
    phone: !!userData.phone,
  };
        fields.forEach(filed=>{
          const control = this.claimForm.get(filed);
          
          if (this.userDataStatus[filed] && control) {
      control.disable();
    } 
        })
      }
}
  ngOnInit(): void {
    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      const userData: UserData | null = this.authService.getUserData();
      this.fillUserData(userData);
    }
    this.fetchPlans();
    this.claimForm.get('company_employee_number')?.valueChanges.subscribe(value => {
      if (value && Number(value) > 0) {
        this.fetchPlans(value);
      } else {
        this.plans = [];
      }
    });
  }
  fetchPlans(value?: number) {
    console.log(value);

    this.medicalInsuranceService.fetchMedicalData(value).pipe(
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
      {
        key: 'company_name',
        value: this.claimForm.get('company_name')?.value,
        include: this.step >= 0,
      },
      {
        key: 'company_address',
        value: this.claimForm.get('company_address')?.value,
        include: this.step >= 0,
      },
      {
        key: 'company_employee_number',
        value: this.claimForm.get('company_employee_number')?.value,
        include: this.step >= 0,
      },
      {
        key: 'company_employee_avg',
        value: this.claimForm.get('company_employee_avg')?.value,
        include: this.step >= 0,
      },
      { key: 'need_call', value: this.claimForm.get('needCall')?.value || 'No', include: this.step >= 1 }
    ];

    fields.forEach(field => {
      if (field.include && field.value) {
        formData.append(field.key, field.value);
      }
    });
    formData.append('lead_type', 'corporate');
    formData.append('request_type', 'corporate');
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
              messages: [errorMessage + '\n'],
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
  updateUserData(): void {
  if (
  Object.values(this.userDataStatus).some(status => status === false) &&
  this.authService.isAuthenticated()
) {
  const updateFormData = new FormData();
    updateFormData.append('user_id', String(this.authService?.getUserId()));
    (Object.keys(this.userDataStatus) as Array<keyof typeof this.userDataStatus>)
      .forEach(key => {
        if (!this.userDataStatus[key]) {
          const value = this.claimForm.get(key)?.value;
          if (value) {
            updateFormData.append(key, value);
          }
        }
      });
    this.authService.updateUserData(updateFormData).subscribe({
      next: res => {
        const userData = this.authService.getUserData();
        const dataNeedUpdate = formDataToObject(updateFormData);
        console.log("updated user data", dataNeedUpdate);
        
        if (userData) {
          const updatedUserData = { ...userData, ...dataNeedUpdate };
          this.authStorage.saveUserData(updatedUserData);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('error while updating user data after lead creation', err);
      },
    });
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
          if (this.step === 5) {
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
      ).subscribe({
        complete: () => {
          this.isLoading = false;
          setTimeout(() => {
            this.alertService.hide();
          }, 2000)
        }
      });
      this.updateUserData();
    } else {
      this.medicalInsuranceService.updateMedicalLead(this.leadId, formData).pipe(
        tap(() => {
          this.step++;
          this.progress = (this.step + 1) * 20;
          if (this.step === 5) {
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
        complete: () => {
          this.isLoading = false;
          setTimeout(() => {
            this.alertService.hide();
          }, 2000)
        }
      });
    }
  }

  pay() {
    this.proceedWithPayment();
  }

  private proceedWithPayment() {
    const policyData: MedicalPolicyCorporateData = {
      category_id: String(this.category!.id),
      user_id: this.authService.getUserId() || '0',
      medical_insurance_id: String(this.selectedPlan!.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      company_name: this.claimForm.get('company_name')?.value,
      company_employee_number: Number(this.claimForm.get('company_employee_number')?.value),
      company_address: this.claimForm.get('company_address')?.value,
      company_employee_avg: this.claimForm.get('company_employee_avg')?.value,
      lead_type: 'corporate',
      request_type: 'corporate',
      active_status: 'requested',
      payment_method: 'Cash',
    };

    const lang = this.translate.currentLang || 'en';
    this.medicalInsuranceService.submitMedicalPolicy(policyData).pipe(
      tap(response => {
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
  onPositionSelected(position: GovernorateOption) {
    // Store the English name as the backend expects it
    this.claimForm.get('company_employee_avg')?.setValue(position ? position.en_name : '');
    this.claimForm.get('company_employee_avg')?.markAsTouched();
  }
  onDropdownFocus(field: string) {
    this.claimForm.get(field)?.markAsTouched();
  }
}
