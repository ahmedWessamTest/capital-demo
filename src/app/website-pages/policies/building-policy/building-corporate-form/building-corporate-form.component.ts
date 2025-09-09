
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GovernorateOption, PolicyDropDownComponent } from '@core/shared/policy-drop-down/policy-drop-down.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserData } from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { Router } from '@angular/router';
import { BuildingInsurance, BuildingCategory, BuildingInsuranceService, BuildingCorporatePolicyData } from '@core/services/policies/building-policy.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { Meta, Title } from '@angular/platform-browser';
@Component({
  selector: 'app-building-corporate-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    PolicyDropDownComponent,
    CarouselModule,
    TranslateModule,
    CustomTranslatePipe,],
  templateUrl: './building-corporate-form.component.html',
  styleUrl: './building-corporate-form.component.css'
})
export class BuildingCorporateFormComponent {
  claimForm: FormGroup;
  step = 0;
  progress = 16.67;
  selectedPlan: BuildingInsurance | null = null;
  leadId: number | null = null;
  isLoading = false;
  showPlans = false;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
  isTextContentLoading = true;
  buildTypes: GovernorateOption[] = [];
  countries: GovernorateOption[] = [];
  plans: BuildingInsurance[] = [];
  category: BuildingCategory | null = null;
  isNeedCallLoading = false;


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
    { en_title: 'Building Type', ar_title: 'نوع المبنى', formFields: ['buildType'] },
    {
      en_title: 'number of units',
      ar_title: 'عدد الوحدات',
      formFields: ['company_building_number'],
    },
    {
      en_title: 'unit prices',
      ar_title: 'سعر الوحدات',
      formFields: ['company_building_total_money'],
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
    nav: true,
    center: true,
    autoplay: true,
    margin: 16,
    responsive: {
      0: { items: 1, nav: true },
      400: { items: 1, nav: true },
      600: { items: 2, nav: true },
      1000: { items: 3, nav: true }
    },
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private buildingInsuranceService: BuildingInsuranceService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private alertService: AlertService,
    private router: Router,
    private authStorage: AuthStorageService,
    private cdr: ChangeDetectorRef
    , private meta: Meta,
    private title: Title,
  ) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      buildType: ['', Validators.required],
      company_name: ['', Validators.required],
      company_address: ['', Validators.required],
      company_building_number: ['', [Validators.required, Validators.min(1)]],
      company_building_total_money: ['', [Validators.required]],
      paymentType: ['Full Payment', Validators.required],
      paymentMethod: ['Cash', Validators.required],
      needCall: ['No']
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.cdr.markForCheck()
      this.updateCarouselDirection(lang);
      this.currentLanguage = lang;
    });



    this.alertSubscription = this.alertService.showAlert$.subscribe(show => {
      if (!show && this.step === 6) {
        this.showPlans = true;
      }
    });
  }

  currentLanguage: string = 'en';

  ngOnInit(): void {
    this.isTextContentLoading = true;

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
    this.fetchPlans();
    this.claimForm.get('company_building_number')?.valueChanges.subscribe(value => {
      if (value && Number(value) > 0) {
        this.fetchPlans(value);
      } else {
        this.plans = [];
      }
    });

  }
  fetchPlans(value?: number) {
    console.log(value);

    this.buildingInsuranceService.fetchBuildingData(value).pipe(
      tap(data => {
        this.category = data.category;
        console.log('category:', data);

        const metaTitle = this.translate.currentLang === 'ar' ? data.category.ar_meta_title : data.category.en_meta_title;
        const metaDescription = this.translate.currentLang === 'ar' ? data.category.ar_meta_description : data.category.en_meta_description;
        this.title.setTitle(metaTitle);
        this.meta.updateTag({ name: 'description', content: metaDescription });
        this.cdr.markForCheck();
        this.plans = this.buildingInsuranceService.getActiveInsurances();
        console.log("data types", data.types);
        this.buildTypes = data.types.map(type => ({
          id: type.id,
          name: type.en_title,
          code: type.en_title,
          en_name: type.en_title,
          ar_name: type.ar_title
        })).concat({
          id: 5,
          name: "both",
          code: "both",
          en_name: "both",
          ar_name: "كلاهما"
        });
        const bothTypeId = this.buildTypes.find(t => t.name === 'both')?.id || null;
        this.claimForm.patchValue({ buildType: bothTypeId });
        this.countries = data.countries.map(country => ({
          id: country.id,
          name: country.en_title,
          code: country.en_title,
          en_name: country.en_title,
          ar_name: country.ar_title
        }));
        this.isTextContentLoading = false;
        this.cdr.markForCheck();
      }),
      catchError(err => {
        console.error('Error fetching building data:', err);
        this.alertService.showNotification({
          translationKeys: { message: 'pages.building_policy.errors.data_fetch_failed' }
        });
        this.isTextContentLoading = false;
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
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



  onBuildTypeSelected(type: GovernorateOption) {
    this.claimForm.get('buildType')?.setValue(type ? type.id : '');
    this.claimForm.get('buildType')?.markAsTouched();
    if (type && type.id !== 0) {
      const countries = this.buildingInsuranceService.getCountriesByType(Number(type.id));
      this.countries = countries.map(country => ({
        id: country.id,
        name: country.en_title,
        code: country.en_title,
        en_name: country.en_title,
        ar_name: country.ar_title
      }));
    } else {
      this.countries = [];
    }
    this.claimForm.get('country')?.setValue('');
  }

  onCountrySelected(country: GovernorateOption) {
    this.claimForm.get('country')?.setValue(country ? country.id : '');
    this.claimForm.get('country')?.markAsTouched();
  }

  onDropdownFocus(field: string) {
    this.claimForm.get(field)?.markAsTouched();
  }

  onPlanSelected(plan: BuildingInsurance) {
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
      { key: 'company_name', value: this.claimForm.get('company_name')?.value, include: this.step >= 0 },
      { key: 'company_address', value: this.claimForm.get('company_address')?.value, include: this.step >= 0 },
      { key: 'company_building_number', value: this.claimForm.get('company_building_number')?.value, include: this.step >= 0 },
      { key: 'company_building_total_money', value: this.claimForm.get('company_building_total_money')?.value, include: this.step >= 0 },
      { key: 'build_type_id', value: this.claimForm.get('buildType')?.value || '', include: this.step >= 0 },
      { key: 'need_call', value: this.claimForm.get('needCall')?.value || 'No', include: this.step >= 3 }
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
      this.buildingInsuranceService.updateBuildingLead(this.leadId, formData).pipe(
        tap(() => {
          let messages = [
            this.translate.instant('pages.building_policy.alerts.call_request_success'),
            this.translate.instant('pages.building_policy.alerts.call_request_contact'),
            this.translate.instant('pages.building_policy.alerts.call_request_thanks')
          ];
          this.alertService.showCallRequest({
            messages,
            buttonLabel: this.translate.instant('pages.building_policy.alerts.back_button'),
          });
        }),
        catchError(err => {
          console.error('Error updating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.building_policy.errors.lead_update_failed' }
          });
          return of(null);
        }),
        tap(() => this.isNeedCallLoading = false)
      ).subscribe();
    } else {
      this.buildingInsuranceService.createBuildingLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          let buttonLabel = this.translate.instant('pages.building_policy.alerts.back_button');
          this.alertService.showCallRequest({
            messages: [
              this.translate.instant('pages.building_policy.alerts.call_request_success'),
              this.translate.instant('pages.building_policy.alerts.call_request_contact'),
              this.translate.instant('pages.building_policy.alerts.call_request_thanks')
            ],
            buttonLabel: buttonLabel,
            redirectRoute: `/${lang}/home`
          });
        }),
        catchError(err => {
          console.error('Error creating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.building_policy.errors.lead_creation_failed' }
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
            });
            this.router.navigate(['/', this.authService.getCurrentLang(), 'login']);
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
      this.buildingInsuranceService.createBuildingLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          this.step++;
          this.progress = (this.step + 1) * 16.67;
          if (this.step === 6) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [
                this.translate.instant('pages.building_policy.alerts.building_request'),
                this.translate.instant('pages.building_policy.alerts.building_request_contact'),
                this.translate.instant('pages.building_policy.alerts.building_request_thanks')
              ],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => {
          console.error('Error creating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.building_policy.errors.lead_creation_failed' }
          });
          return of(null);
        })
      ).subscribe({
        complete: () => {
          this.isLoading = false;
          setTimeout(() => {
            this.alertService.hide()
          }, 1000)
        }
      });
    } else {
      this.buildingInsuranceService.updateBuildingLead(this.leadId, formData).pipe(
        tap(() => {
          this.step++;
          this.progress = (this.step + 1) * 16.67;
          if (this.step === 6) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [this.translate.instant('pages.building_policy.alerts.building_request')],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => {
          console.error('Error updating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.building_policy.errors.lead_update_failed' }
          });
          return of(null);
        })
      ).subscribe({
        complete: () => {
          this.isLoading = false;
          setTimeout(() => {
            this.alertService.hide()
          }, 1000)
        }
      });
    }
  }

  pay() {
    if (!this.selectedPlan || !this.category) {
      this.alertService.showNotification({
        translationKeys: { message: 'pages.building_policy.errors.no_plan_selected' }
      });
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    this.proceedWithPayment();
  }


  private proceedWithPayment() {
    const policyData: BuildingCorporatePolicyData = {
      category_id: String(this.category!.id),
      user_id: this.authService.getUserId() || '0',
      building_insurance_id: String(this.selectedPlan!.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      building_type_id: String(this.claimForm.get('buildType')?.value),
      building_type: this.buildTypes.find(type => type.id === this.claimForm.get('buildType')?.value)?.name,
      company_name: this.claimForm.get('company_name')?.value,
      company_address: this.claimForm.get('company_address')?.value,
      company_building_number: this.claimForm.get('company_building_number')?.value,
      company_building_total_money: this.claimForm.get('company_building_total_money')?.value,
      payment_method: 'Cash',
      active_status: 'requested',
      lead_type: 'corporate',
      request_type: 'corporate',
    };

    const lang = this.translate.currentLang || 'en';
    this.buildingInsuranceService.submitBuildingPolicy(policyData).pipe(
      tap(response => {
        console.log('Policy submitted:', response);
        this.alertService.showGeneral({
          messages: [
            this.translate.instant('pages.building_policy.alerts.policy_submitted'),
            this.translate.instant('pages.building_policy.alerts.policy_review'),
            `${this.translate.instant('pages.building_policy.alerts.request_code')} ${response.data.id}`
          ],
          buttonLabel: this.translate.instant('pages.building_policy.alerts.back_button'),
          redirectRoute: `/${lang}/home`
        });
        this.router.navigate(['/', lang, 'home']);

        this.claimForm.reset();
        this.step = 0;
        this.buildTypes = [];
        this.countries = [];
        this.plans = [];
        this.category = null;
        this.progress = 16.67;
        this.selectedPlan = null;
        this.leadId = null;
      }),
      catchError(err => {
        console.error('Error submitting policy:', err);
        this.alertService.showNotification({
          translationKeys: { message: this.translate.instant('pages.building_policy.errors.policy_submission_failed') }
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
