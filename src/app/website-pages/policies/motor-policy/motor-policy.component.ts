import { AuthStorageService } from './../../../core/services/auth/auth-storage.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GovernorateOption, PolicyDropDownComponent } from '@core/shared/policy-drop-down/policy-drop-down.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { UserData } from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { MotorInsurance, MotorCategory, MotorInsuranceService, MotorPolicyData } from '@core/services/policies/motors-policy.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { Router } from '@angular/router';
import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { PartnersLogosComponent } from "../parteners-logos/parteners-logos.component";
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-motor-policy',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PolicyDropDownComponent,
    CarouselModule,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlPipe,
    PartnersLogosComponent
  ],
  templateUrl: './motor-policy.component.html',
  styleUrls: ['./motor-policy.component.css']
})
export class MotorPolicyComponent implements OnInit, OnDestroy {
  claimForm: FormGroup;
  showForm = false;
  step = 0;
  progress = 14.29;
  selectedPlan: MotorInsurance | null = null;
  leadId: number | null = null;
  isLoading = false;
  isNeedCallLoading = false;
  showPlans = false;
  isTextContentLoading = true;
  isImageLoading = true;
  imageLoaded = false;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;

  carBrands: GovernorateOption[] = [];
  carModels: GovernorateOption[] = [];
  carYears: GovernorateOption[] = [];
  plans: MotorInsurance[] = [];
  carTypes: GovernorateOption[] = [];
  category: MotorCategory | null = null;

  steps = [
    { en_title: 'Personal Information', ar_title: 'المعلومات الشخصية', formFields: ['name', 'phone', 'email'] },
    { en_title: 'Car Type', ar_title: 'نوع السيارة', formFields: ['carType'] },
    { en_title: 'Car Price', ar_title: 'سعر السيارة', formFields: ['carPrice'] },
    { en_title: 'Car Year', ar_title: 'سنة السيارة', formFields: ['carYear'] },
    { en_title: 'Car Brand', ar_title: 'ماركة السيارة', formFields: ['carBrand'] },
    { en_title: 'Car Model', ar_title: 'طراز السيارة', formFields: ['carModel'] },
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
    },
    rtl: false
  };
  counters: Counter[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private motorInsuranceService: MotorInsuranceService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private genericDataService: UpdatedGenericDataService,
    private alertService: AlertService,
    private router: Router,
    private authStorage: AuthStorageService,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title,
  ) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      carType: ['', Validators.required],
      carPrice: ['', [Validators.required, Validators.min(100000)]],
      carYear: ['', [Validators.required, this.maxCarYearValidator(new Date().getFullYear())]],
      carBrand: ['', Validators.required],
      carModel: ['', Validators.required],
      paymentType: ['Full Payment', Validators.required],
      paymentMethod: ['Cash', Validators.required],
      needCall: ['No'],
      otherCarYear: [''],
      otherCarBrand: [''],
      otherCarModel: ['']
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.cdr.markForCheck();
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

  platformId = inject(PLATFORM_ID);

  scrollToForm(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const formElement = document.getElementById('policy-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  }

  onCarYearSelected(year: GovernorateOption) {
    this.claimForm.get('carYear')?.setValue(year ? year.id : '');
    this.claimForm.get('carYear')?.markAsTouched();

    if (year && year.id === 0) {
      this.claimForm.get('otherCarYear')?.setValidators([
        Validators.required,
        this.maxCarYearValidator(new Date().getFullYear()),
        Validators.min(1900)
      ]);
      this.claimForm.get('otherCarYear')?.updateValueAndValidity();
    } else {
      this.claimForm.get('otherCarYear')?.clearValidators();
      this.claimForm.get('otherCarYear')?.updateValueAndValidity();
      this.claimForm.get('otherCarYear')?.setValue('');
    }
  }
 noArabicValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const arabicRegex = /[\u0600-\u06FF]/; 
    return arabicRegex.test(control.value) ? { arabicNotAllowed: true } : null;
  };
}
  onCarBrandSelected(brand: GovernorateOption) {
    this.claimForm.get('carBrand')?.setValue(brand ? brand.id : '');
    this.claimForm.get('carBrand')?.markAsTouched();
    console.log(brand);
    console.log(this.claimForm.get('carBrand'))
    if (brand && brand.id === 15) {
      this.claimForm.get('otherCarBrand')?.setValidators([Validators.required,this.noArabicValidator()]);
      this.claimForm.get('otherCarBrand')?.updateValueAndValidity();
    } else {
      this.claimForm.get('otherCarBrand')?.clearValidators();
      this.claimForm.get('otherCarBrand')?.updateValueAndValidity();
      this.claimForm.get('otherCarBrand')?.setValue('');
    }

    if (brand && brand.id !== 0) {
      const models = this.motorInsuranceService.getModelsByBrand(Number(brand.id));
      this.carModels = models.map(model => ({
        id: model.id,
        name: model.en_title,
        code: model.en_title,
        en_name: model.en_title,
        ar_name: model.ar_title
      })).concat({ id: 0, name: 'Other', code: 'OTHER_MODEL', en_name: 'Other', ar_name: 'أخرى' });
    } else {
      this.carModels = [{ id: 0, name: 'Other', code: 'OTHER_MODEL', en_name: 'Other', ar_name: 'أخرى' }];
    }
    this.claimForm.get('carModel')?.setValue('');
  }

  onCarModelSelected(model: GovernorateOption) {
    this.claimForm.get('carModel')?.setValue(model ? model.id : '');
    this.claimForm.get('carModel')?.markAsTouched();

    if (model && model.id === 0) {
      this.claimForm.get('otherCarModel')?.setValidators([Validators.required]);
      this.claimForm.get('otherCarModel')?.updateValueAndValidity();
    } else {
      this.claimForm.get('otherCarModel')?.clearValidators();
      this.claimForm.get('otherCarModel')?.updateValueAndValidity();
      this.claimForm.get('otherCarModel')?.setValue('');
    }
  }

  onCarTypeSelected(type: GovernorateOption) {
    this.claimForm.get('carType')?.setValue(type ? type.id : '');
    this.claimForm.get('carType')?.markAsTouched();
  }

  onDropdownFocus(field: string) {
    this.claimForm.get(field)?.markAsTouched();
  }

  onPlanSelected(plan: MotorInsurance) {
    this.selectedPlan = plan;
    this.step++;
    this.progress = 100;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const currentStep = this.step;

    if (currentStep >= 0) {
      formData.append('name', this.claimForm.get('name')?.value || '');
      formData.append('phone', this.claimForm.get('phone')?.value || '');
      formData.append('email', this.claimForm.get('email')?.value || '');
    }

    if (currentStep >= 1) {
      const carTypeId = this.claimForm.get('carType')?.value || '';
      formData.append('car_type_id', carTypeId);
      formData.append('car_type', this.carTypes.find(type => type.id === carTypeId)?.name || 'Other');
    }

    if (currentStep >= 2) {
      formData.append('car_price', this.claimForm.get('carPrice')?.value || '');
      formData.append('need_call', this.claimForm.get('needCall')?.value || 'No');
    }

    if (currentStep >= 3) {
      const carYearValue = this.claimForm.get('carYear')?.value;
      formData.append('car_year', carYearValue === 0 ? this.claimForm.get('otherCarYear')?.value || '' : carYearValue?.toString() || '');
    }

    if (currentStep >= 4) {
      const carBrandValue = this.claimForm.get('carBrand')?.value;
      formData.append('car_brand_id', carBrandValue === 0 ? '10000' : carBrandValue?.toString() || '');
      formData.append('car_brand', carBrandValue === 15 ? this.claimForm.get('otherCarBrand')?.value || '' : this.carBrands.find(brand => brand.id === carBrandValue)?.name || '');
      formData.append('payment_method', "Cash");
    }

    if (currentStep >= 5) {
      const carModelValue = this.claimForm.get('carModel')?.value;
      formData.append('car_model_id', carModelValue === 0 ? '10000' : carModelValue?.toString() || '');
      formData.append('car_model', carModelValue === 0 ? this.claimForm.get('otherCarModel')?.value || '' : this.carModels.find(model => model.id === carModelValue)?.name || '');
    }

    return formData;
  }

  needCall() {
    this.isNeedCallLoading = true;
    this.claimForm.get('needCall')?.setValue('Yes');
    const formData = this.createFormData();
    const lang = this.translate.currentLang || 'en';
    if (this.leadId) {
      this.motorInsuranceService.updateMotorLead(this.leadId, formData).pipe(
        tap(() => {
          let messages = [
            this.translate.instant('pages.motor_policy.alerts.call_request_success'),
            this.translate.instant('pages.motor_policy.alerts.call_request_contact'),
            this.translate.instant('pages.motor_policy.alerts.call_request_thanks')
          ];
          this.alertService.showCallRequest({
            messages,
            buttonLabel: this.translate.instant('pages.motor_policy.alerts.back_button'),
          });
        }),
        catchError(err => {
          console.error('Error updating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.motor_policy.errors.lead_update_failed' }
          });
          return of(null);
        }),
        tap(() => this.isNeedCallLoading = false)
      ).subscribe();
    } else {
      this.motorInsuranceService.createMotorLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          let buttonLabel = this.translate.instant('pages.motor_policy.alerts.back_button');
          this.alertService.showCallRequest({
            messages: [
              this.translate.instant('pages.motor_policy.alerts.call_request_success'),
              this.translate.instant('pages.motor_policy.alerts.call_request_contact'),
              this.translate.instant('pages.motor_policy.alerts.call_request_thanks')
            ],
            buttonLabel: buttonLabel,
            redirectRoute: `/${lang}/home`
          });
        }),
        catchError(err => {
          console.error('Error creating lead with need call:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.motor_policy.errors.lead_creation_failed' }
          });
          return of(null);
        }),
        tap(() => this.isNeedCallLoading = false)
      ).subscribe();
    }
  }

  maxCarYearValidator(maxYear: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const year = control.value;
      if (year && (isNaN(year) || year > maxYear)) {
        return { maxYear: { max: maxYear, actual: year } };
      }
      return null;
    };
  }

  ngOnInit(): void {
    this.isTextContentLoading = true;
    this.isImageLoading = false;
    this.imageLoaded = false;

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
    this.genericDataService.getCounters().subscribe(data => {
      this.counters = data.filter((counter: Counter) => counter.id === 6);
      this.cdr.markForCheck();
      console.log("counters", this.counters)
    });
    this.motorInsuranceService.fetchMotorData().pipe(
      tap(data => {
        this.category = data.category;

        const metaTitle = this.translate.currentLang === 'ar' ? data.category.ar_meta_title : data.category.en_meta_title;
        const metaDescription = this.translate.currentLang === 'ar' ? data.category.ar_meta_description : data.category.en_meta_description;
        this.title.setTitle(metaTitle);
        this.meta.updateTag({ name: 'description', content: metaDescription });
        this.cdr.markForCheck();
        this.plans = this.motorInsuranceService.getActiveInsurances();
        this.carYears = data.years.map(year => ({
          id: year,
          name: year.toString(),
          code: `YEAR_${year}`,
          ar_name: ''
        })).concat({ id: 0, name: 'Other', ar_name: 'اخري', code: 'OTHER_YEAR' });
        this.carBrands = data.brands.map(brand => ({
          id: brand.id,
          name: brand.en_title,
          code: brand.en_title,
          en_name: brand.en_title,
          ar_name: brand.ar_title
        }));
        this.carTypes = data.types.map(type => ({
          id: type.id,
          name: type.en_title,
          code: type.en_title,
          en_name: type.en_title,
          ar_name: type.ar_title
        }));
        this.isTextContentLoading = false;
        this.cdr.markForCheck();
      }),
      catchError(err => {
        console.error('Error fetching motor data:', err);
        this.alertService.showNotification({
          translationKeys: { message: 'pages.motor_policy.errors.data_fetch_failed' }
        });
        this.isTextContentLoading = false;
        this.cdr.markForCheck();
        return of(null);
      })
    ).subscribe();
  }

  onImageLoad(): void {
    this.imageLoaded = true;
    this.isImageLoading = false;
    this.cdr.markForCheck();
  }

  onImageError(): void {
    this.isImageLoading = false;
    this.imageLoaded = false;
    this.alertService.showNotification({
      translationKeys: { message: 'pages.motor_policy.errors.image_load_failed' }
    });
    this.cdr.markForCheck();
  }

  nextStep() {
    if (this.isLoading) return;

    const currentStepFields = this.steps[this.step].formFields;

    currentStepFields.forEach(field => {
      const control = this.claimForm.get(field);
      if (control && !control.disabled) {
        control.markAsTouched();
      }
    });

    this.markOtherFieldsAsTouched();

    this.isLoading = true;

    const isStepValid = this.isCurrentStepValid(currentStepFields);

    if (isStepValid) {
      if (this.step === 0 && !this.authService.isAuthenticated()) {
        this.checkAuthenticationBeforeProceeding().subscribe({
          next: (authSuccess) => {
            if (authSuccess) {
              this.proceedWithNextStep();
            } else {
              this.isLoading = false;
            }
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.proceedWithNextStep();
      }
    } else {
      this.isLoading = false;
    }
  }

  private markOtherFieldsAsTouched(): void {
    if (this.step === 3 && this.claimForm.get('carYear')?.value === 0) {
      this.claimForm.get('otherCarYear')?.markAsTouched();
    }
    if (this.step === 4 && this.claimForm.get('carBrand')?.value === 15) {
      this.claimForm.get('otherCarBrand')?.markAsTouched();
    }
    if (this.step === 5 && this.claimForm.get('carModel')?.value === 0) {
      this.claimForm.get('otherCarModel')?.markAsTouched();
    }
  }

  private isCurrentStepValid(currentStepFields: string[]): boolean {
    const regularFieldsValid = currentStepFields.every(field => {
      const control = this.claimForm.get(field);
      return control?.disabled || control?.valid;
    });

    let otherFieldsValid = true;

    if (this.step === 3 && this.claimForm.get('carYear')?.value === 0) {
      const otherYearControl = this.claimForm.get('otherCarYear');
      otherFieldsValid = otherFieldsValid && (otherYearControl?.valid ?? false);
    }

    if (this.step === 4 && this.claimForm.get('carBrand')?.value === 15) {
      const otherBrandControl = this.claimForm.get('otherCarBrand');
      otherFieldsValid = otherFieldsValid && (otherBrandControl?.valid ?? false);
    }

    if (this.step === 5 && this.claimForm.get('carModel')?.value === 0) {
      const otherModelControl = this.claimForm.get('otherCarModel');
      otherFieldsValid = otherFieldsValid && (otherModelControl?.valid ?? false);
    }

    return regularFieldsValid && otherFieldsValid;
  }

  private proceedWithNextStep() {
    const formData = this.createFormData();
    if (this.step === 0 || !this.leadId) {
      this.motorInsuranceService.createMotorLead(formData).pipe(
        tap(response => {
          this.leadId = response.data.id;
          this.step++;
          this.progress = (this.step + 1) * 14.29;
          if (this.step === 6) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [
                this.translate.instant('pages.motor_policy.alerts.building_request'),
                this.translate.instant('pages.motor_policy.alerts.building_request_contact'),
                this.translate.instant('pages.motor_policy.alerts.building_request_thanks')
              ],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => {
          console.error('Error creating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.motor_policy.errors.lead_creation_failed' }
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
      this.motorInsuranceService.updateMotorLead(this.leadId, formData).pipe(
        tap(() => {
          this.step++;
          this.progress = (this.step + 1) * 14.29;
          if (this.step === 6) {
            this.showPlans = false;
            this.alertService.showGeneral({
              messages: [this.translate.instant('pages.motor_policy.alerts.building_request')],
              imagePath: 'assets/common/loading.gif',
              secondaryImagePath: 'assets/common/otp.gif'
            });
          }
        }),
        catchError(err => {
          console.error('Error updating lead:', err);
          this.alertService.showNotification({
            translationKeys: { message: 'pages.motor_policy.errors.lead_update_failed' }
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
    this.proceedWithPayment();
  }

  public proceedWithPayment() {
    if (!this.selectedPlan || !this.category) {
      this.alertService.showNotification({
        translationKeys: { message: 'pages.motor_policy.errors.no_plan_selected' }
      });
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    const policyData: MotorPolicyData = {
      category_id: String(this.category.id),
      user_id: this.authService.getUserId() || '0',
      motor_insurance_id: String(this.selectedPlan.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      car_type_id: String(this.claimForm.get('carType')?.value),
      car_price: String(this.claimForm.get('carPrice')?.value),
      car_year: String(this.claimForm.get('carYear')?.value === 0 ? this.claimForm.get('otherCarYear')?.value : this.claimForm.get('carYear')?.value || '0'),
      car_brand_id: String(this.claimForm.get('carBrand')?.value === 15 ? '10000' : this.claimForm.get('carBrand')?.value || '0'),
      car_model_id: String(this.claimForm.get('carModel')?.value === 0 ? '10000' : this.claimForm.get('carModel')?.value || '0'),
      car_brand: this.claimForm.get('carBrand')?.value === 15 ? this.claimForm.get('otherCarBrand')?.value || 'Other' : this.carBrands.find(brand => brand.id === this.claimForm.get('carBrand')?.value)?.name || 'Other',
      car_model: this.claimForm.get('carModel')?.value === 0 ? this.claimForm.get('otherCarModel')?.value || 'Other' : this.carModels.find(model => model.id === this.claimForm.get('carModel')?.value)?.name || 'Other',
      car_type: this.carTypes.find(type => type.id === this.claimForm.get('carType')?.value)?.name || 'Other',
      payment_method: 'Cash',
      active_status: 'requested'
    };

    const lang = this.translate.currentLang || 'en';
    this.motorInsuranceService.submitMotorPolicy(policyData).pipe(
      tap(response => {
        console.log('Policy submitted:', response);
        this.alertService.showGeneral({
          messages: [
            this.translate.instant('pages.motor_policy.alerts.policy_submitted'),
            this.translate.instant('pages.motor_policy.alerts.policy_review'),
            `${this.translate.instant('pages.motor_policy.alerts.request_code')} ${response.data.id}`
          ],
          buttonLabel: this.translate.instant('pages.motor_policy.alerts.back_button'),
          redirectRoute: `/${lang}/policies`
        });
        this.router.navigate(['/', lang, 'home']);

        this.claimForm.reset();
        this.step = 0;
        this.carBrands = [];
        this.carModels = [];
        this.carYears = [];
        this.plans = [];
        this.carTypes = [];
        this.category = null;
        this.progress = 14.29;
        this.selectedPlan = null;
        this.leadId = null;
      }),
      catchError(err => {
        console.error('Error submitting policy:', err);
        this.alertService.showNotification({
          translationKeys: { message: this.translate.instant('pages.motor_policy.errors.policy_submission_failed') }
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

  private checkAuthenticationBeforeProceeding(): Observable<boolean> {
    if (!this.authService.isAuthenticated()) {
      const formData = this.claimForm.value;
      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: 'defaultPassword123'
      };

      return this.authService.register(registerData).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error:', error);
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
        }),
        map(() => true)
      );
    }
    return of(true);
  }

  goBack() {
    history.back();
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

