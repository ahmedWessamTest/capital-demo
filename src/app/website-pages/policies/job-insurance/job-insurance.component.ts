import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import {
  AuthStorageService,
  UserData,
} from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import {
  JopPolicyData,
  JopPolicyService,
} from '@core/services/policies/jop-policy.service';
import {
  Counter,
  UpdatedGenericDataService,
} from '@core/services/updated-general.service';
import { AlertService } from '@core/shared/alert/alert.service';
import {
  GovernorateOption,
  PolicyDropDownComponent,
} from '@core/shared/policy-drop-down/policy-drop-down.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, delay, finalize, tap } from 'rxjs/operators';
import { PartnersLogosComponent } from '../parteners-logos/parteners-logos.component';
import { JopCategory, JopInsurance } from './res/JobInsurancePolicy';

@Component({
  selector: 'app-job-insurance',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PolicyDropDownComponent,
    CarouselModule,
    TranslateModule,
    CustomTranslatePipe,
    SafeHtmlPipe,
    PartnersLogosComponent,
  ],
  templateUrl: './job-insurance.component.html',
  styleUrl: './job-insurance.component.css',
})
export class JobInsuranceComponent {
  claimForm: FormGroup;
  showForm = false;
  step = 0;
  progress = 16.67;
  selectedPlan: JopInsurance | null = null;
  leadId: number | null = null;
  isLoading = false;
  isContentLoading = true;
  isNeedCallLoading = false;
  showPlans = false;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
  counters: Counter[] = [];
  platformId = inject(PLATFORM_ID);
  isTextContentLoading = true;
  isImageLoading = false;
  imageLoaded = false;

  plans: JopInsurance[] = [];
  category: JopCategory | null = null;

  positionOptions: GovernorateOption[] = [
    {
      id: 1,
      name: 'Lawyers and legal consultants',
      code: 'lawyers',
      en_name: 'Lawyers and legal consultants',
      ar_name: 'المحامون والمستشارون القانونيون',
    },
    {
      id: 2,
      name: 'Accountants and auditors',
      code: 'accountants',
      en_name: 'Accountants and auditors',
      ar_name: 'المحاسبين والمدققين',
    },
    {
      id: 3,
      name: 'Insurance brokers and agents',
      code: 'insurance',
      en_name: 'Insurance brokers and agents',
      ar_name: 'وسطاء ووكلاء التأمين',
    },
    {
      id: 4,
      name: 'Doctors, dentists, and other medical professionals',
      code: 'medical',
      en_name: 'Doctors, dentists, and other medical professionals',
      ar_name: 'الأطباء وأطباء الأسنان وغيرهم من المهنيين الطبيين',
    },
    {
      id: 5,
      name: 'Engineers and architects',
      code: 'engineers',
      en_name: 'Engineers and architects',
      ar_name: 'المهندسين والمعماريين',
    },
    {
      id: 6,
      name: 'IT consultants and software developers',
      code: 'it',
      en_name: 'IT consultants and software developers',
      ar_name: 'مستشارو تكنولوجيا المعلومات ومطورو البرمجيات',
    },
    {
      id: 7,
      name: 'Management and business consultants',
      code: 'consultants',
      en_name: 'Management and business consultants',
      ar_name: 'مستشارو الإدارة والأعمال',
    },
    {
      id: 8,
      name: 'Surveyors and valuers',
      code: 'surveyors',
      en_name: 'Surveyors and valuers',
      ar_name: 'المساحون والمثمنون',
    },
    {
      id: 9,
      name: 'Media, marketing, creative agencies providing professional services',
      code: 'media',
      en_name:
        'Media, marketing, creative agencies providing professional services',
      ar_name: 'وسائط، تسويق، الوكالات الإبداعية التي تقدم خدمات احترافية',
    },
  ];

  steps = [
    {
      en_title: 'Personal Information',
      ar_title: 'المعلومات الشخصية',
      formFields: ['name', 'phone', 'email'],
    },
    {
      en_title: 'Position/Profession',
      ar_title: 'المنصب/المهنة',
      formFields: ['jop_title'],
    },
    {
      en_title: 'Job Price',
      ar_title: 'سعر الوظيفة',
      formFields: ['jop_price'],
    },
    {
      en_title: 'Documents Upload',
      ar_title: 'رفع المستندات',
      formFields: ['jop_main_id'],
    },
    { en_title: 'Select Plan', ar_title: 'اختيار الخطة', formFields: [] },
    {
      en_title: 'Payment',
      ar_title: 'الدفع',
      formFields: ['paymentType', 'paymentMethod'],
    },
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
      1000: { items: 3, nav: true },
    },
    rtl: false,
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private jopPolicyService: JopPolicyService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private alertService: AlertService,
    private router: Router,
    private genericDataService: UpdatedGenericDataService,
    private authStorage: AuthStorageService,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title
  ) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      jop_title: ['', Validators.required],
      jop_price: [
        '',
        [Validators.required, Validators.min(50000), Validators.max(1000000)],
      ],
      jop_main_id: ['', Validators.required],
      jop_second_id: [''], // Not required
      paymentType: ['Full Payment', Validators.required],
      paymentMethod: ['Cash', Validators.required],
      needCall: ['No'],
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang) => {
        this.cdr.markForCheck();
        this.updateCarouselDirection(lang);
        this.currentLanguage = lang;
      }
    );

    this.genericDataService.getCounters().subscribe((data) => {
      console.log(data);
      this.counters = data.filter((counter) => counter.id === 5);
      this.cdr.markForCheck();
    });

    this.alertSubscription = this.alertService.showAlert$.subscribe((show) => {
      if (!show && this.step === 4) {
        this.showPlans = true;
        console.log("after plan");
      }
    });
  }
  currentLanguage: string = 'en';

  ngOnInit(): void {
    this.isTextContentLoading = true;
    this.isImageLoading = false; // Initialize to false to trigger image load immediately
    this.imageLoaded = false;

    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      const userData: UserData | null = this.authService.getUserData();
      if (userData) {
        this.claimForm.patchValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
        this.claimForm.get('name')?.disable();
        this.claimForm.get('phone')?.disable();
        this.claimForm.get('email')?.disable();
      }
    }

    this.jopPolicyService
      .getInsurancePolicies()
      .pipe(
        tap((data) => {
          console.log('this.category', data);
          this.category = data.category;

          const metaTitle =
            this.translate.currentLang === 'ar'
              ? data.category.ar_meta_title
              : data.category.en_meta_title;
          const metaDescription =
            this.translate.currentLang === 'ar'
              ? data.category.ar_meta_description
              : data.category.en_meta_description;
              console.log(metaTitle)
          this.title.setTitle(metaTitle);
          this.meta.updateTag({
            name: 'description',
            content: metaDescription,
          });
          this.cdr.markForCheck();
          this.plans = data.category.jopinsurances;
          console.log('this.plans', data.category);
          // Types are now included in the JopInsurance interface

          this.isTextContentLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((err) => {
          console.error('Error fetching job data:', err);
          this.alertService.showNotification({
            translationKeys: {
              message: 'pages.professional_indemnity.errors.data_fetch_failed',
            },
          });
          this.isTextContentLoading = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe();

    this.genericDataService.getCounters().subscribe((data) => {
      this.counters = data.filter((counter) => counter.id === 5);
      this.cdr.markForCheck();
    });
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
      translationKeys: {
        message: 'pages.professional_indemnity.errors.image_load_failed',
      },
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
        navText: isRtl ? ['التالي', 'السابق'] : ['Previous', 'Next'],
      };
    }
  }

  scrollToForm(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const formElement = document.getElementById('policy-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 50);
  }

  // onBuildTypeSelected(type: GovernorateOption) {
  //   this.claimForm.get('buildType')?.setValue(type ? type.id : '');
  //   this.claimForm.get('buildType')?.markAsTouched();
  //   if (type && type.id !== 0) {
  //     const countries = this.buildingInsuranceService.getCountriesByType(
  //       Number(type.id)
  //     );
  //     this.countries = countries.map((country) => ({
  //       id: country.id,
  //       name: country.en_title,
  //       code: country.en_title,
  //       en_name: country.en_title,
  //       ar_name: country.ar_title,
  //     }));
  //   } else {
  //     this.countries = [];
  //   }
  //   this.claimForm.get('country')?.setValue('');
  // }

  onCountrySelected(country: GovernorateOption) {
    this.claimForm.get('country')?.setValue(country ? country.id : '');
    this.claimForm.get('country')?.markAsTouched();
  }

  onDropdownFocus(field: string) {
    this.claimForm.get(field)?.markAsTouched();
  }

  onPositionSelected(position: GovernorateOption) {
    // Store the English name as the backend expects it
    this.claimForm.get('jop_title')?.setValue(position ? position.en_name : '');
    this.claimForm.get('jop_title')?.markAsTouched();
  }

  onFileSelected(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.alertService.showNotification({
          translationKeys: {
            message: 'pages.professional_indemnity.errors.invalid_file_type',
          },
        });
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.alertService.showNotification({
          translationKeys: {
            message: 'pages.professional_indemnity.errors.file_too_large',
          },
        });
        input.value = '';
        return;
      }

      this.claimForm.get(fieldName)?.setValue(file);
      this.claimForm.get(fieldName)?.markAsTouched();
    }
  }

  onPlanSelected(plan: JopInsurance) {
    this.selectedPlan = plan;
    this.step++;
    this.progress = 100;
  }

  private createFormData(): FormData {
    const formData = new FormData();
    const fields = [
      {
        key: 'name',
        value: this.claimForm.get('name')?.value,
        include: this.step >= 0,
      },
      {
        key: 'phone',
        value: this.claimForm.get('phone')?.value,
        include: this.step >= 0,
      },
      {
        key: 'email',
        value: this.claimForm.get('email')?.value,
        include: this.step >= 0,
      },
      {
        key: 'jop_title',
        value: this.claimForm.get('jop_title')?.value,
        include: this.step >= 0,
      },
      {
        key: 'jop_price',
        value: this.claimForm.get('jop_price')?.value,
        include: this.step >= 0,
      },
      {
        key: 'jop_main_id',
        value: this.claimForm.get('jop_main_id')?.value,
        include: this.step >= 0,
      },
      {
        key: 'jop_second_id',
        value: this.claimForm.get('jop_second_id')?.value,
        include: this.step >= 0,
      },

      {
        key: 'need_call',
        value: this.claimForm.get('needCall')?.value || 'No',
        include: this.step >= 3,
      },
    ];

    fields.forEach((field) => {
      if (field.include && field.value) {
        formData.append(field.key, field.value);
      }
    });
    formData.append('category_id', '5');

    return formData;
  }

  needCall() {
    this.isNeedCallLoading = true;
    this.claimForm.get('needCall')?.setValue('Yes');
    const formData = this.createFormData();
    const lang = this.translate.currentLang || 'en';
    if (this.leadId) {
      this.jopPolicyService
        .updateLead(this.leadId, formData)
        .pipe(
          tap((response) => {
            let buttonLabel = this.translate.instant(
              'pages.professional_indemnity.alerts.back_button'
            );
            this.alertService.showCallRequest({
              messages: [
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_success'
                ),
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_contact'
                ),
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_thanks'
                ),
              ],
              buttonLabel: buttonLabel,
              redirectRoute: `/${lang}/home`,
            });
          }),
          catchError((err) => {
            console.error('Error updating lead with need call:', err);
            this.alertService.showNotification({
              translationKeys: {
                message: 'pages.professional_indemnity.errors.lead_update_failed',
              },
            });
            return of(null);
          }),
          tap(() => (this.isNeedCallLoading = false))
        )
        .subscribe();
    } else {
      this.jopPolicyService
        .createLead(formData)
        .pipe(
          tap((response) => {
            let buttonLabel = this.translate.instant(
              'pages.professional_indemnity.alerts.back_button'
            );
            this.alertService.showCallRequest({
              messages: [
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_success'
                ),
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_contact'
                ),
                this.translate.instant(
                  'pages.professional_indemnity.alerts.call_request_thanks'
                ),
              ],
              buttonLabel: buttonLabel,
              redirectRoute: `/${lang}/home`,
            });
          }),
          catchError((err) => {
            console.error('Error creating lead with need call:', err);
            this.alertService.showNotification({
              translationKeys: {
                message: 'pages.professional_indemnity.errors.lead_creation_failed',
              },
            });
            return of(null);
          }),
          tap(() => (this.isNeedCallLoading = false))
        )
        .subscribe();
    }
  }

  nextStep() {
    const currentStepFields = this.steps[this.step].formFields;
    currentStepFields.forEach((field) => {
      const control = this.claimForm.get(field);
      if (control && !control.disabled) {
        control.markAsTouched();
      }
    });

    const isStepValid = currentStepFields.every((field) => {
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
        password: 'defaultPassword123',
      };

      this.authService
        .register(registerData)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Registration error:', error);
            this.isLoading = false;
            let errorMessage = this.translate.instant(
              'pages.home_form.errors.registration_failed'
            );

            if (
              (error.status === 422 || error.status === 400) &&
              error.error?.errors
            ) {
              if (error.error.errors.email) {
                errorMessage += `\n- ${this.translate.instant(
                  'pages.home_form.errors.email_exist'
                )}`;
              }
              if (error.error.errors.phone) {
                errorMessage += `\n- ${this.translate.instant(
                  'pages.home_form.errors.phone_exist'
                )}`;
              }
              this.alertService.showGeneral({
                messages: [errorMessage + '\n'],
              });
              this.router.navigate([
                '/',
                this.authService.getCurrentLang(),
                'login',
              ]);
            } else {
              alert(
                this.translate.instant(
                  'pages.home_form.errors.unexpected_error'
                )
              );
            }
            return new Observable((observer) => observer.error(error));
          }),
          tap((response: any) => {
            console.log('User registered successfully:', response);
            this.authStorage.saveUserData(response.user);
          })
        )
        .subscribe({
          next: () => {
            this.proceedWithNextStep();
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.proceedWithNextStep();
    }
  }

  private proceedWithNextStep() {
    const formData = this.createFormData();
    if (this.step === 0) {
      console.log(formData, 'formDatabefore');
      this.jopPolicyService
        .createLead(formData)
        .pipe(
          tap((response: any) => {
            this.leadId = response.data.id;
            this.step++;
            this.progress = (this.step + 1) * 16.67;
            if (this.step === 4) {
              this.showPlans = false;
              this.alertService.showGeneral({
                messages: [
                  this.translate.instant(
                    'pages.building_policy.alerts.building_request'
                  ),
                  this.translate.instant(
                    'pages.building_policy.alerts.building_request_contact'
                  ),
                  this.translate.instant(
                    'pages.building_policy.alerts.building_request_thanks'
                  ),
                ],
                imagePath: 'assets/common/loading.gif',
                secondaryImagePath: 'assets/common/otp.gif',
              });
            }
          }),
          catchError((err) => {
            console.error('Error creating lead:', err);
            this.alertService.showNotification({
              translationKeys: {
                message: 'pages.building_policy.errors.lead_creation_failed',
              },
            });
            return of(null);
          })
        )
        .subscribe({complete:()=>{
          this.isLoading = false;
          setTimeout(()=>{
            this.alertService.hide();
          },1000)
        }});
    } else {
      this.jopPolicyService
        .updateLead( this.leadId!,formData)
        .pipe(
          tap(() => {
            this.step++;
            this.progress = (this.step + 1) * 16.67;
            if (this.step === 4) {
              this.showPlans = false;
              this.alertService.showGeneral({
                messages: [
                  this.translate.instant(
                    'pages.building_policy.alerts.building_request'
                  ),
                ],
                imagePath: 'assets/common/loading.gif',
                secondaryImagePath: 'assets/common/otp.gif',
              });
            }
          }),
          catchError((err) => {
            console.error('Error updating lead:', err);
            this.alertService.showNotification({
              translationKeys: {
                message: 'pages.building_policy.errors.lead_update_failed',
              },
            });
            return of(null);
          })
        )
        .subscribe({complete:()=>{
          this.isLoading = false;
          setTimeout(()=>{
            this.alertService.hide(); 
          },1000)
        }});
    }
  }

  pay() {
    if (!this.selectedPlan || !this.category) {
      this.alertService.showNotification({
        translationKeys: {
          message: 'pages.building_policy.errors.no_plan_selected',
        },
      });
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    this.proceedWithPayment();
  }

  private proceedWithPayment() {
    const policyData: JopPolicyData = {
      category_id: String(this.category!.id),
      user_id: this.authService.getUserId() || '0',
      jop_insurance_id: String(this.selectedPlan!.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      jop_title: this.claimForm.get('jop_title')?.value,
      jop_price: this.claimForm.get('jop_price')?.value,
      jop_main_id: this.claimForm.get('jop_main_id')?.value,
      jop_second_id: this.claimForm.get('jop_second_id')?.value,
      payment_method: 'Cash',
      active_status: 'requested',
    };
    const lang = this.translate.currentLang || 'en';

    if (this.leadId) {
      // Handle async operation properly
      this.jopPolicyService.getLead(this.leadId).subscribe((res: any) => {
        const finalPolicyData = {
          ...policyData,
          jop_main_id: res.data.jop_main_id,
          jop_second_id: res.data.jop_second_id,
        };

        console.log('policyData', finalPolicyData);
        console.log('claimForm', this.claimForm);

        // Store policy with updated data
        this.jopPolicyService
          .storePolicy(finalPolicyData)
          .pipe(
            tap((response) => {
              console.log('Policy submitted:', response);
              this.alertService.showGeneral({
                messages: [
                  this.translate.instant(
                    'pages.professional_indemnity.alerts.policy_submitted'
                  ),
                  this.translate.instant(
                    'pages.professional_indemnity.alerts.policy_review'
                  ),
                  `${this.translate.instant(
                    'pages.professional_indemnity.alerts.request_code'
                  )} `,
                ],
                buttonLabel: this.translate.instant(
                  'pages.professional_indemnity.alerts.back_button'
                ),
                redirectRoute: `/${lang}/home`,
              });
              this.router.navigate(['/', lang, 'home']);

              this.claimForm.reset();
              this.step = 0;
              this.plans = [];
              this.category = null;
              this.progress = 16.67;
              this.selectedPlan = null;
              this.leadId = null;
            }),
            catchError((err) => {
              console.error('Error submitting policy:', err);
              this.alertService.showNotification({
                translationKeys: {
                  message: this.translate.instant(
                    'pages.professional_indemnity.errors.policy_submission_failed'
                  ),
                },
              });
              return of(null);
            })
          )
          .subscribe();
      });
    } else {
      // Handle case when there's no leadId
      console.log('policyData', policyData);
      console.log('claimForm', this.claimForm);

      this.jopPolicyService
        .storePolicy(policyData)
        .pipe(
          tap((response) => {
            console.log('Policy submitted:', response);
            this.alertService.showGeneral({
              messages: [
                this.translate.instant(
                  'pages.professional_indemnity.alerts.policy_submitted'
                ),
                this.translate.instant(
                  'pages.professional_indemnity.alerts.policy_review'
                ),
                `${this.translate.instant(
                  'pages.professional_indemnity.alerts.request_code'
                )} `,
              ],
              buttonLabel: this.translate.instant(
                'pages.professional_indemnity.alerts.back_button'
              ),
              redirectRoute: `/${lang}/home`,
            });
            this.router.navigate(['/', lang, 'home']);

            this.claimForm.reset();
            this.step = 0;
            this.plans = [];
            this.category = null;
            this.progress = 16.67;
            this.selectedPlan = null;
            this.leadId = null;
          }),
          catchError((err) => {
            console.error('Error submitting policy:', err);
            this.alertService.showNotification({
              translationKeys: {
                message: this.translate.instant(
                  'pages.professional_indemnity.errors.policy_submission_failed'
                ),
              },
            });
            return of(null);
          })
        )
        .subscribe();
    }
  }

  isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  goBack() {
    history.back();
  }

  isNumber(str: string): boolean {
    return !isNaN(Number(str)) && str.trim() !== '';
  }

  preventPaste(event: Event): void {
    event.preventDefault();
  }

  preventNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];
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
      this.claimForm.get('name')?.setValue(filteredValue);
    }
  }
}
