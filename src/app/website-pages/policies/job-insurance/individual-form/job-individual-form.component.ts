import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
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

import { AlertService } from '@core/shared/alert/alert.service';
import {
  GovernorateOption,
  PolicyDropDownComponent,
} from '@core/shared/policy-drop-down/policy-drop-down.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { JopCategory, JopInsurance } from '../res/JobInsurancePolicy';
import { formDataToObject } from '@core/utils/form-utils';

@Component({
  selector: 'app-job-individual-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    PolicyDropDownComponent,
    CarouselModule,
    TranslateModule,
    CustomTranslatePipe,
    
    ],
  templateUrl: './job-individual-form.component.html',
  styleUrl: './job-individual-form.component.css'
})
export class JobIndividualFormComponent {
  userDataStatus:Record<string, boolean> = {
name: false,
email: false,
    phone: false,
  };
  claimForm: FormGroup;
  step = 0;
  progress = 16.67;
  selectedPlan: JopInsurance | null = null;
  leadId: number | null = null;
  isLoading = false;
  isNeedCallLoading = false;
  showPlans = false;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
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
    {
      id: 10,
      name: 'Other',
      code: 'other',
      en_name: 'Other',
      ar_name: 'أخرى',
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
      customJobTitle: [''], // Add custom job title field
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

    

    this.alertSubscription = this.alertService.showAlert$.subscribe((show) => {
      if (!show && this.step === 4) {
        this.showPlans = true;
        console.log("after plan");
      }
    });
  }
  currentLanguage: string = 'en';
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
          this.title.setTitle(metaTitle);
          this.meta.updateTag({
            name: 'description',
            content: metaDescription,
          });
          this.cdr.markForCheck();
          this.plans = data.category.jopinsurances;
          // Types are now included in the JopInsurance interface

          this.cdr.markForCheck();
        }),
        catchError((err) => {
          console.error('Error fetching job data:', err);
          this.alertService.showNotification({
            translationKeys: {
              message: 'pages.professional_indemnity.errors.data_fetch_failed',
            },
          });
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe();
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
    
    // Handle Other option - add/remove validation for customJobTitle
    if (position && position.en_name === 'Other') {
      this.claimForm.get('customJobTitle')?.setValidators([Validators.required]);
    } else {
      this.claimForm.get('customJobTitle')?.clearValidators();
      this.claimForm.get('customJobTitle')?.setValue('');
    }
    this.claimForm.get('customJobTitle')?.updateValueAndValidity();
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

    // Special handling for step 1 (Position/Profession) - validate customJobTitle if "Other" is selected
    if (this.step === 1 && this.claimForm.get('jop_title')?.value === 'Other') {
      const customJobTitleControl = this.claimForm.get('customJobTitle');
      if (customJobTitleControl && !customJobTitleControl.disabled) {
        customJobTitleControl.markAsTouched();
      }
    }

    const isStepValid = currentStepFields.every((field) => {
      const control = this.claimForm.get(field);
      return control?.disabled || control?.valid;
    });

    // Additional validation for customJobTitle when "Other" is selected
    if (this.step === 1 && this.claimForm.get('jop_title')?.value === 'Other') {
      const customJobTitleControl = this.claimForm.get('customJobTitle');
      if (customJobTitleControl && !customJobTitleControl.disabled && !customJobTitleControl.valid) {
        return;
      }
    }

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
        this.updateUserData();
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
    // Determine the job title to send
    const jobTitle = this.claimForm.get('jop_title')?.value === 'Other' 
      ? this.claimForm.get('customJobTitle')?.value 
      : this.claimForm.get('jop_title')?.value;

    const policyData: JopPolicyData = {
      category_id: String(this.category!.id),
      user_id: this.authService.getUserId() || '0',
      jop_insurance_id: String(this.selectedPlan!.id),
      name: this.claimForm.get('name')?.value,
      email: this.claimForm.get('email')?.value,
      phone: this.claimForm.get('phone')?.value,
      jop_title: jobTitle, // Use the determined job title
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
            tap((response:any) => {
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
                  ) } ${response?.data.id} `,
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
