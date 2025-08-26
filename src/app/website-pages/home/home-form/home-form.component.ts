import {
  CommonModule,
  isPlatformBrowser,
  NgOptimizedImage,
} from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/language.service';
import {
  BuildingInsurance,
  BuildingInsuranceService,
  BuildType,
  Country,
} from '@core/services/policies/building-policy.service';
import { JopPolicyService } from '@core/services/policies/jop-policy.service';
import {
  MedicalInsurance,
  MedicalInsuranceService,
} from '@core/services/policies/medical-policy.service';
import {
  CarBrand,
  CarModel,
  CarType,
  MotorInsurance,
  MotorInsuranceService,
} from '@core/services/policies/motors-policy.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { HeadingComponent } from '@core/shared/heading/heading.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../../../core/conf/api.config';
import { AuthStorageService } from '../../../core/services/auth/auth-storage.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CustomeDropMenuComponent } from '../../../core/shared/custome-drop-menu/custome-drop-menu.component';
interface InsuranceType {
  id: string;
  name: string;
  en_name: string;
  ar_name: string;
  active: boolean;
}

interface DropdownOption {
  title: string;
  code: string;
  agreed: boolean;
}

interface UserPolicy {
  id: number;
  user_id: number;
  category_id: number;
  [key: string]: any;
}

interface UserPoliciesResponse {
  user: any;
  medical: UserPolicy[];
  motor: UserPolicy[];
  building: UserPolicy[];
}

@Component({
  selector: 'app-home-form',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    HttpClientModule,
    CustomeDropMenuComponent,
    TranslateModule,
    CustomTranslatePipe,
    HeadingComponent,
  ],
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css'],
})
export class HomeFormComponent implements OnInit, OnDestroy {
  claimForm!: FormGroup;
  currentStep: number = 1;
  isManualPolicy: boolean = false;
  dropdownOptions: DropdownOption[] = [];
  isLoadingPolicies: boolean = false;
  userPolicies: UserPoliciesResponse | null = null;
  isLoadingNext: boolean = false;
  isLoadingSubmit: boolean = false;
  private languageSubscription!: Subscription;
  public Object = Object;
  private baseUrl = API_CONFIG.BASE_URL;
  insuranceTypes: InsuranceType[] = [
    {
      id: 'car',
      name: 'Car ',
      en_name: 'Car ',
      ar_name: 'تأمين السيارة',
      active: true,
    },
    {
      id: 'medical',
      name: 'Medical ',
      en_name: 'Medical ',
      ar_name: 'التأمين الطبي',
      active: false,
    },
    {
      id: 'property',
      name: 'Property ',
      en_name: 'Property ',
      ar_name: 'تأمين العقارات',
      active: false,
    },
    {
      id: 'jop',
      name: 'Professional ',
      en_name: 'Professional ',
      ar_name: 'تأمين الوظائف',
      active: false,
    },
  ];

  carTypes: CarType[] = [];
  carBrands: CarBrand[] = [];
  carModels: CarModel[] = [];
  carYears: number[] = [];
  motorInsurances: MotorInsurance[] = [];
  medicalInsurances: MedicalInsurance[] = [];
  buildingTypes: BuildType[] = [];
  buildingCountries: Country[] = [];
  filteredBuildingCountries: Country[] = [];
  buildingInsurances: BuildingInsurance[] = [];

  // Job insurance properties
  showCustomJobTitle = false;
  selectedMainIdFile: File | null = null;
  selectedSecondIdFile: File | null = null;
  jobTitleOptions = [
    {
      en: 'Lawyers and legal consultants',
      ar: 'المحامون والمستشارون القانونيون',
    },
    { en: 'Accountants and auditors', ar: 'المحاسبون والمراجعون' },
    { en: 'Insurance brokers and agents', ar: 'وسطاء ووكلاء التأمين' },
    {
      en: 'Doctors, dentists, and other medical professionals',
      ar: 'الأطباء وأطباء الأسنان وغيرهم من المتخصصين في المجال الطبي',
    },
    { en: 'Engineers and architects', ar: 'المهندسون والمعماريون' },
    {
      en: 'IT consultants and software developers',
      ar: 'مستشارو تكنولوجيا المعلومات ومطورو البرمجيات',
    },
    {
      en: 'Management and business consultants',
      ar: 'مستشارو الإدارة والأعمال',
    },
    { en: 'Surveyors and valuers', ar: 'المسّاحون والمثمنون' },
    {
      en: 'Media, marketing, and creative agencies providing professional services',
      ar: 'وكالات الإعلام والتسويق والإبداع التي تقدم خدمات مهنية',
    },
    { en: 'Others', ar: 'آخرون' },
  ];

  @Input() isClaim: boolean = true;
  formFieldsConfig: {
    [key: string]: {
      type: string;
      placeholder: string;
      options?: { value: string | number; label: string }[];
    };
  } = {
    fullName: { type: 'text', placeholder: 'pages.home_form.fields.fullName' },
    email: { type: 'email', placeholder: 'pages.home_form.fields.email' },
    phoneNumber: {
      type: 'tel',
      placeholder: 'pages.home_form.fields.phoneNumber',
    },
    selectedPolicy: {
      type: 'dropdown',
      placeholder: 'pages.home_form.fields.selectedPolicy',
    },
    message: {
      type: 'textarea',
      placeholder: 'pages.home_form.fields.message',
    },
    birthdate: {
      type: 'date',
      placeholder: 'pages.home_form.fields.birthdate',
    },
    gender: {
      type: 'select',
      placeholder: 'pages.home_form.fields.gender',
      options: [
        { value: 'male', label: 'pages.home_form.options.male' },
        { value: 'female', label: 'pages.home_form.options.female' },
      ],
    },
    insurancePolicyNumber: {
      type: 'text',
      placeholder: 'pages.home_form.fields.insurancePolicyNumber',
    },
    notes: { type: 'textarea', placeholder: 'pages.home_form.fields.notes' },
    car_type_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.car_type_id',
    },
    car_brand_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.car_brand_id',
    },
    car_model_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.car_model_id',
    },
    car_year: {
      type: 'select',
      placeholder: 'pages.home_form.fields.car_year',
    },
    car_price: {
      type: 'number',
      placeholder: 'pages.home_form.fields.car_price',
    },
    motor_insurance_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.motor_insurance_id',
    },
    medical_insurance_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.medical_insurance_id',
    },
    building_type_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.building_type_id',
    },
    building_country_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.building_country_id',
    },
    building_price: {
      type: 'number',
      placeholder: 'pages.home_form.fields.building_price',
    },
    building_insurance_id: {
      type: 'select',
      placeholder: 'pages.home_form.fields.building_insurance_id',
    },
    jop_title: {
      type: 'select',
      placeholder: 'pages.home_form.fields.jop_title',
    },
    custom_jop_title: {
      type: 'text',
      placeholder: 'pages.home_form.fields.custom_jop_title',
    },
    jop_price: {
      type: 'number',
      placeholder: 'pages.home_form.fields.jop_price',
    },
    jop_main_id: {
      type: 'file',
      placeholder: 'pages.home_form.fields.jop_main_id',
    },
    jop_second_id: {
      type: 'file',
      placeholder: 'pages.home_form.fields.jop_second_id',
    },
  };

  private categoryIds: { [key: string]: number } = {
    medical: 1,
    car: 2,
    property: 3,
    jop: 5,
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authStorage: AuthStorageService,
    private authService: AuthService,
    private motorInsuranceService: MotorInsuranceService,
    private medicalInsuranceService: MedicalInsuranceService,
    private buildingInsuranceService: BuildingInsuranceService,
    private jopPolicyService: JopPolicyService,
    private router: Router,
    public translate: TranslateService,
    private alertService: AlertService,
    private languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.claimForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)],
      ],
    });

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang) => {
        this.updateDirection(lang);
      }
    );
  }

  ngOnInit(): void {
    const initialActiveType = this.insuranceTypes.find((type) => type.active);
    if (!initialActiveType) {
      this.insuranceTypes[0].active = true;
    }
    this.currentStep = 1;
    this.prefillUserData();
  }

  private updateDirection(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute(
        'dir',
        lang === 'ar' ? 'rtl' : 'ltr'
      );
    }
  }

  private fetchUserPolicies(): Observable<UserPoliciesResponse | null> {
    const userId = this.authStorage.getUserData()?.id;
    if (userId) {
      this.isLoadingPolicies = true;
      const params = new HttpParams().set('type', 'all');
      return this.http
        .get<UserPoliciesResponse>(
          `${this.baseUrl}app-profile/userpolicy/${userId}`,
          { params }
        )
        .pipe(
          tap((response) => {
            this.userPolicies = response;
            this.fetchPolicyOptions();
            this.isLoadingPolicies = false;
          }),
          catchError((error) => {
            console.error('Error fetching user policies:', error);
            this.isLoadingPolicies = false;
            return of(null);
          })
        );
    }
    return of(null);
  }

  private prefillUserData(): void {
    const userData = this.authStorage.getUserData();
    if (userData) {
      this.claimForm.patchValue({
        fullName: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phone || '',
      });
    }
  }

  selectInsuranceType(selectedType: InsuranceType): void {
    this.insuranceTypes.forEach((type) => {
      type.active = type.id === selectedType.id;
    });
    this.isManualPolicy = false;
    this.resetDropdownSelection();
    this.updateFormFields();
    this.fetchPolicyOptions();
  }

  private resetDropdownSelection(): void {
    this.dropdownOptions = [];
    this.claimForm.get('selectedPolicy')?.patchValue('');
  }

  private fetchPolicyOptions(): void {
    this.isLoadingPolicies = true;
    this.dropdownOptions = [];

    const activeType =
      this.insuranceTypes.find((type) => type.active)?.id || 'medical';
    if (this.userPolicies) {
      let policies: UserPolicy[] = [];
      switch (activeType) {
        case 'medical':
          policies = this.userPolicies.medical;
          this.dropdownOptions = policies.map((policy) => ({
            title: policy['name'],
            code: policy['medical_insurance_number'],
            agreed: policy['active_status'] === 'confirmed',
          }));
          break;
        case 'car':
          policies = this.userPolicies.motor;
          this.dropdownOptions = policies.map((policy) => ({
            title: policy['name'],
            code: policy['motor_insurance_number'],
            agreed: policy['active_status'] === 'active',
          }));
          break;
        case 'property':
          policies = this.userPolicies.building;
          this.dropdownOptions = policies.map((policy) => ({
            title: policy['name'],
            code: policy['building_insurance_number'],
            agreed: policy['active_status'] === 'active',
          }));
          break;
      }
      this.isLoadingPolicies = false;
    } else {
      this.isLoadingPolicies = false;
    }
  }

  updateFormFields(): void {
    const activeType = this.insuranceTypes.find((type) => type.active)?.id;
    const currentValues = this.claimForm.value;

    const setControl = (name: string, value: any, validators: any[]) => {
      if (this.claimForm.get(name)) {
        this.claimForm.get(name)?.patchValue(value);
        this.claimForm.get(name)?.setValidators(validators);
      } else {
        this.claimForm.addControl(name, this.fb.control(value, validators));
      }
      this.claimForm.get(name)?.updateValueAndValidity();
    };

    const removeControls = (fieldNames: string[]) => {
      fieldNames.forEach((fieldName) => {
        if (this.claimForm.contains(fieldName)) {
          this.claimForm.removeControl(fieldName);
        }
      });
    };

    const allPossibleDynamicFields = [
      'selectedPolicy',
      'message',
      'birthdate',
      'gender',
      'insurancePolicyNumber',
      'notes',
      'status',
      'category_id',
      'user_id',
      'medical_insurance_id',
      'motor_insurance_id',
      'building_insurance_id',
      'car_type_id',
      'car_brand_id',
      'car_model_id',
      'car_year',
      'car_price',
      'building_type_id',
      'building_country_id',
      'building_price',
      'jop_title',
      'custom_jop_title',
      'jop_price',
      'jop_main_id',
      'jop_second_id',
    ];

    removeControls(allPossibleDynamicFields);

    if (this.currentStep === 1) {
      setControl('fullName', currentValues.fullName || '', [
        Validators.required,
        Validators.minLength(2),
      ]);
      setControl('email', currentValues.email || '', [
        Validators.required,
        Validators.email,
      ]);
      setControl('phoneNumber', currentValues.phoneNumber || '', [
        Validators.required,
        Validators.pattern(/^01[0125]\d{8}$/),
      ]);
    } else if (this.currentStep === 2) {
      setControl('fullName', currentValues.fullName || '', [
        Validators.required,
        Validators.minLength(2),
      ]);
      setControl('email', currentValues.email || '', [
        Validators.required,
        Validators.email,
      ]);
      setControl('phoneNumber', currentValues.phoneNumber || '', [
        Validators.required,
        Validators.pattern(/^01[0125]\d{8}$/),
      ]);

      if (this.isManualPolicy) {
        setControl(
          'insurancePolicyNumber',
          currentValues.insurancePolicyNumber || '',
          [Validators.required, Validators.minLength(4)]
        );
        setControl('notes', currentValues.notes || '', [
          Validators.required,
          Validators.minLength(10),
        ]);
        setControl('status', 'REQUESTED', [Validators.required]);
        setControl('user_id', this.authStorage.getUserData()?.id || '', [
          Validators.required,
        ]);
        setControl('category_id', this.categoryIds[activeType!], [
          Validators.required,
        ]);

        switch (activeType) {
          case 'medical':
            setControl(
              'birthdate',
              this.formatDateToYMD(currentValues.birthdate) || '',
              [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]
            );
            setControl('gender', currentValues.gender || '', [
              Validators.required,
            ]);
            // setControl('medical_insurance_id', currentValues.medical_insurance_id || '', [Validators.required]);

            this.medicalInsuranceService.fetchMedicalData().subscribe({
              next: (data) => {
                this.medicalInsurances = data.category.medicalinsurances.filter(
                  (ins) => ins.active_status === '1'
                );
                this.formFieldsConfig['medical_insurance_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.medicalInsurances.map((ins) => ({
                    value: ins.id,
                    label: `${ins.en_title} (${ins.company_name} (${ins.month_money} / ${ins.year_money}))`,
                  })),
                ];
              },
              error: (err) =>
                console.error('Error fetching medical data:', err),
            });
            break;

          case 'car':
            setControl('car_type_id', currentValues.car_type_id || '', [
              Validators.required,
            ]);
            setControl('car_brand_id', currentValues.car_brand_id || '', [
              Validators.required,
            ]);
            setControl('car_model_id', currentValues.car_model_id || '', [
              Validators.required,
            ]);
            setControl('car_year', currentValues.car_year || '', [
              Validators.required,
              Validators.pattern(/^\d{4}$/),
            ]);
            setControl('car_price', currentValues.car_price || '', [
              Validators.required,
              Validators.pattern(/^[0-9]+$/),

              Validators.min(500000),
            ]);
            // setControl('motor_insurance_id', currentValues.motor_insurance_id || '', [Validators.required]);

            this.motorInsuranceService.fetchMotorData().subscribe({
              next: (data) => {
                this.carTypes = data.types.filter(
                  (type) => type.active_status === '1'
                );
                this.carBrands = data.brands.filter(
                  (brand) => brand.active_status === '1'
                );
                this.carYears = data.years;
                this.motorInsurances = data.category.motorinsurances.filter(
                  (ins) => ins.active_status === '1'
                );

                this.formFieldsConfig['car_type_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.carTypes.map((type) => ({
                    value: type.id,
                    label: type.en_title,
                  })),
                ];
                this.formFieldsConfig['car_brand_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.carBrands.map((brand) => ({
                    value: brand.id,
                    label: brand.en_title,
                  })),
                ];
                this.formFieldsConfig['car_year'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.carYears.map((year) => ({
                    value: year,
                    label: year.toString(),
                  })),
                ];
                this.formFieldsConfig['motor_insurance_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.motorInsurances.map((ins) => ({
                    value: ins.id,
                    label: `${ins.en_title} (${ins.company_name} (${ins.month_money} / ${ins.year_money}))`,
                  })),
                ];

                if (currentValues.car_brand_id) {
                  this.onCarBrandChange({
                    target: { value: currentValues.car_brand_id },
                  } as any);
                }
              },
              error: (err) => console.error('Error fetching motor data:', err),
            });
            break;

          case 'property':
            setControl(
              'building_type_id',
              currentValues.building_type_id || '',
              [Validators.required]
            );
            setControl(
              'building_country_id',
              currentValues.building_country_id || '',
              [Validators.required]
            );
            setControl('building_price', currentValues.building_price || '', [
              Validators.required,
              Validators.pattern(/^[0-9]+$/),
              Validators.min(500000),
            ]);
            // setControl('building_insurance_id', currentValues.building_insurance_id || '', [Validators.required]);

            this.buildingInsuranceService.fetchBuildingData().subscribe({
              next: (data) => {
                this.buildingTypes = data.types.filter(
                  (type) => type.active_status === '1'
                );
                this.buildingCountries = data.countries.filter(
                  (country) => country.active_status === '1'
                );
                this.buildingInsurances =
                  data.category.buildinginsurances.filter(
                    (ins) => ins.active_status === '1'
                  );

                this.formFieldsConfig['building_type_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.buildingTypes.map((type) => ({
                    value: type.id,
                    label: type.en_title,
                  })),
                ];
                this.formFieldsConfig['building_country_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.buildingCountries.map((country) => ({
                    value: country.id,
                    label: country.en_title,
                  })),
                ];
                this.formFieldsConfig['building_insurance_id'].options = [
                  // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
                  ...this.buildingInsurances.map((ins) => ({
                    value: ins.id,
                    label: `${ins.en_title} (${ins.company_name} (${ins.month_money} / ${ins.year_money}))`,
                  })),
                ];

                if (currentValues.building_type_id) {
                  this.onBuildingTypeChange({
                    target: { value: currentValues.building_type_id },
                  } as any);
                }
              },
              error: (err) =>
                console.error('Error fetching building data:', err),
            });
            break;

          case 'jop':
            setControl('jop_title', currentValues.jop_title || '', [
              Validators.required,
            ]);
            setControl(
              'custom_jop_title',
              currentValues.custom_jop_title || '',
              []
            );
            setControl('jop_price', currentValues.jop_price || '', [
              Validators.required,
              Validators.min(50000),
              Validators.max(1000000),
            ]);
            setControl('jop_main_id', currentValues.jop_main_id || '', [
              Validators.required,
            ]);
            setControl('jop_second_id', currentValues.jop_second_id || '', []);

            // Setup job title options
            this.formFieldsConfig['jop_title'].options =
              this.jobTitleOptions.map((option) => ({
                value:
                  this.translate.currentLang === 'ar' ? option.ar : option.en,
                label:
                  this.translate.currentLang === 'ar' ? option.ar : option.en,
              }));
            break;
        }
      } else {
        setControl('selectedPolicy', currentValues.selectedPolicy || '', [
          Validators.required,
        ]);
        setControl('message', currentValues.message || '', [
          Validators.required,
          Validators.minLength(10),
        ]);
      }
    }

    this.claimForm.updateValueAndValidity();
    this.claimForm.markAsUntouched();
  }

  onCarBrandChange(event: Event): void {
    const brandId = +(event.target as HTMLSelectElement).value;
    this.carModels = this.motorInsuranceService.getModelsByBrand(brandId);
    this.claimForm.get('car_model_id')?.patchValue('');
    this.formFieldsConfig['car_model_id'].options = [
      // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
      ...this.carModels.map((model) => ({
        value: model.id,
        label: model.en_title,
      })),
    ];
  }

  onBuildingTypeChange(event: Event): void {
    const typeId = +(event.target as HTMLSelectElement).value;
    this.filteredBuildingCountries =
      this.buildingInsuranceService.getCountriesByType(typeId);
    this.claimForm.get('building_country_id')?.patchValue('');
    this.formFieldsConfig['building_country_id'].options = [
      // { value: 0, label: this.translate.instant('pages.home_form.options.other') },
      ...this.filteredBuildingCountries.map((country) => ({
        value: country.id,
        label: country.en_title,
      })),
    ];
  }

  onNextStep(): void {
    this.claimForm.markAllAsTouched();
    const step1Fields = ['fullName', 'email', 'phoneNumber'];
    const isStep1Valid = step1Fields.every(
      (field) => this.claimForm.get(field)?.valid
    );

    if (isStep1Valid) {
      this.isLoadingNext = true;
      if (!this.authStorage.isAuthenticated()) {
        const registerData = {
          name: this.claimForm.value.fullName,
          email: this.claimForm.value.email,
          phone: this.claimForm.value.phoneNumber,
          password: 'defaultPassword123',
        };

        this.authService
          .register(registerData)
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Registration error:', error);
              this.isLoadingNext = false;
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
                  buttonLabel: this.translate.instant(
                    'pages.home_form.errors.login'
                  ),
                  redirectRoute: `/${this.authService.getCurrentLang()}/login`,
                });
                // this.router.navigate(['/', this.authService.getCurrentLang(), 'login']);
              } else {
                alert(
                  this.translate.instant(
                    'pages.home_form.errors.unexpected_error'
                  )
                );
              }
              return new Observable((observer) => observer.error(error));
            })
          )
          .subscribe({
            next: (response: any) => {
              console.log('User registered successfully:', response);
              this.authStorage.saveUserData(response.user);
              this.claimForm.patchValue({ user_id: response.user.id });
              this.fetchUserPolicies().subscribe({
                next: () => {
                  this.currentStep = 2;
                  this.updateFormFields();
                  this.isLoadingNext = false;
                },
                error: () => {
                  this.isLoadingNext = false;
                },
              });
            },
          });
      } else {
        this.fetchUserPolicies().subscribe({
          next: () => {
            this.currentStep = 2;
            this.updateFormFields();
            this.isLoadingNext = false;
          },
          error: () => {
            this.isLoadingNext = false;
          },
        });
      }
    } else {
      this.markFormGroupTouched();
      console.warn('Step 1 form is invalid. Please check the fields.');
    }
  }

  onSelect(option: DropdownOption): void {
    this.isManualPolicy = false;
    this.claimForm.patchValue({ selectedPolicy: option.code });
    this.updateFormFields();
  }

  onManualPolicyAdd(): void {
    this.isManualPolicy = true;
    this.claimForm.get('selectedPolicy')?.patchValue('');
    this.updateFormFields();
  }

  onSubmit(): void {
    this.claimForm.markAllAsTouched();
    console.log(this.claimForm.value);
    if (this.claimForm.valid) {
      this.isLoadingSubmit = true;
      const formValue = this.claimForm.value;
      const activeType =
        this.insuranceTypes.find((type) => type.active)?.id || 'medical';
      let submissionObservable: Observable<any>;
      let payload: any = {
        name: formValue.fullName,
        email: formValue.email,
        phone: formValue.phoneNumber,
        user_id:
          formValue.user_id ||
          this.authStorage.getUserData()?.id?.toString() ||
          '',
        status: 'requested',
        category_id: this.categoryIds[activeType].toString(),
        medical_insurance_id: formValue.medical_insurance_id,
        motor_insurance_id: formValue.motor_insurance_id,
        building_insurance_id: formValue.building_insurance_id,
      };

      if (this.isManualPolicy) {
        payload.description = formValue.notes;
        switch (activeType) {
          case 'medical':
            payload.birthdate = this.formatDateToYMD(formValue.birthdate);
            payload.gender = formValue.gender;
            // payload.medical_insurance_id = formValue.medical_insurance_id;
            payload.medical_insurance_number = formValue.insurancePolicyNumber;
            submissionObservable =
              this.medicalInsuranceService.createMedicalClaim(payload);
            break;
          case 'car':
            payload.car_type_id = formValue.car_type_id;
            payload.car_brand_id = formValue.car_brand_id;
            payload.motor_insurance_number = formValue.insurancePolicyNumber;
            const selectedBrand = this.carBrands.find(
              (b) => b.id === +formValue.car_brand_id
            );
            if (selectedBrand) {
              payload.car_brand = selectedBrand.en_title;
            }
            payload.car_model_id = formValue.car_model_id;
            const selectedModel = this.carModels.find(
              (m) => m.id === +formValue.car_model_id
            );
            if (selectedModel) {
              payload.car_model = selectedModel.en_title;
            }
            payload.car_year = formValue.car_year;
            payload.car_price = formValue.car_price;
            // payload.motor_insurance_id = formValue.motor_insurance_id;
            submissionObservable =
              this.motorInsuranceService.createMotorClaim(payload);
            break;
          case 'property':
            payload.building_type_id = formValue.building_type_id;
            payload.building_type = this.buildingTypes.find(
              (type) => type.id === +formValue.building_type_id
            )?.en_title;
            payload.building_country_id = formValue.building_country_id;
            const selectedCountry = this.buildingCountries.find(
              (c) => c.id === +formValue.building_country_id
            );
            if (selectedCountry) {
              payload.building_country = selectedCountry.en_title;
            }
            payload.building_price = formValue.building_price;
            // payload.building_insurance_id = formValue.building_insurance_id;
            payload.building_insurance_number = formValue.insurancePolicyNumber;
            submissionObservable =
              this.buildingInsuranceService.createBuildingClaim(payload);
            break;
          case 'jop':
            payload.description = formValue.notes;

            // Handle job title (use custom if Others is selected)
            const othersOption =
              this.translate.currentLang === 'ar' ? 'آخرون' : 'Others';
            const jobTitle =
              formValue.jop_title === othersOption
                ? formValue.custom_jop_title
                : formValue.jop_title;
            payload.jop_title = jobTitle;
            payload.jop_price = formValue.jop_price;

            // Handle file uploads
            if (this.selectedMainIdFile) {
              payload.jop_main_id = this.selectedMainIdFile;
            }
            if (this.selectedSecondIdFile) {
              payload.jop_second_id = this.selectedSecondIdFile;
            }

            submissionObservable = this.jopPolicyService.createJobClaim(
              this.createJobClaimFormData(payload)
            );
            break;
          default:
            console.error(
              'Unknown active insurance type for manual submission.'
            );
            alert(
              this.translate.instant(
                'pages.home_form.errors.invalid_insurance_type'
              )
            );
            this.isLoadingSubmit = false;
            return;
        }
      } else {
        payload.description = formValue.message;
        const selectedPolicy = this.userPolicies
          ? (activeType === 'medical'
              ? this.userPolicies.medical
              : activeType === 'car'
              ? this.userPolicies.motor
              : this.userPolicies.building
            ).find((policy) => {
              // Fix the field name mapping for finding the policy
              const fieldName =
                activeType === 'car'
                  ? 'motor_insurance_number'
                  : activeType === 'property'
                  ? 'building_insurance_number'
                  : 'medical_insurance_number';
              return policy[fieldName] === formValue.selectedPolicy;
            })
          : null;

        if (selectedPolicy) {
          console.log('Selected Policy:', selectedPolicy); // Debug log

          // Map the insurance type correctly
          const mappedType =
            activeType === 'car'
              ? 'motor'
              : activeType === 'property'
              ? 'building'
              : 'medical';

          // Common fields for all types
          payload[`${mappedType}_insurance_id`] =
            selectedPolicy[`${mappedType}_insurance_id`];
          payload[`${mappedType}_insurance_number`] =
            selectedPolicy[`${mappedType}_insurance_number`];
          payload[`admin_${mappedType}_insurance_number`] =
            selectedPolicy[`admin_${mappedType}_insurance_number`];

          // Add payment method if exists
          if (selectedPolicy['payment_method']) {
            payload['payment_method'] = selectedPolicy['payment_method'];
          }

          if (activeType === 'car') {
            console.log('Adding car specific fields:', selectedPolicy);
            // Add all motor insurance specific fields
            payload['car_type_id'] = selectedPolicy['car_type_id'];
            payload['car_type'] = selectedPolicy['car_type'];
            payload['car_brand_id'] = selectedPolicy['car_brand_id'];
            payload['car_brand'] = selectedPolicy['car_brand'];
            payload['car_model_id'] = selectedPolicy['car_model_id'];
            payload['car_model'] = selectedPolicy['car_model'];
            payload['car_year'] = selectedPolicy['car_year'];
            payload['car_price'] = selectedPolicy['car_price'];
          } else if (activeType === 'property') {
            console.log('Adding property specific fields:', selectedPolicy);
            // Add all building insurance specific fields
            payload['building_type_id'] = selectedPolicy['building_type_id'];
            payload['building_type'] = selectedPolicy['building_type'];
            payload['building_country_id'] =
              selectedPolicy['building_country_id'];
            payload['building_country'] = selectedPolicy['building_country'];
            payload['building_price'] = selectedPolicy['building_price'];
            payload['building_insurance_id'] =
              selectedPolicy['building_insurance_id'];
          } else if (activeType === 'medical') {
            console.log('Adding medical specific fields:', selectedPolicy);
            // Add all medical insurance specific fields
            payload['birthdate'] = this.formatDateToYMD(
              selectedPolicy['birthdate']
            );
            payload['gender'] = selectedPolicy['gender'];
            payload['medical_insurance_id'] =
              selectedPolicy['medical_insurance_id'];
          }
        } else {
          console.warn('Selected policy not found in user policies');
        }

        let genericSubmitEndpoint: string;
        switch (activeType) {
          case 'medical':
            genericSubmitEndpoint = `${this.baseUrl}app-claims/claim-medical-store`;
            break;
          case 'car':
            genericSubmitEndpoint = `${this.baseUrl}app-claims/claim-motor-store`;
            break;
          case 'property':
            genericSubmitEndpoint = `${this.baseUrl}app-claims/claim-building-store`;
            break;
          default:
            console.error(
              'Unknown active insurance type for non-manual submission.'
            );
            alert(
              this.translate.instant(
                'pages.home_form.errors.invalid_insurance_type'
              )
            );
            this.isLoadingSubmit = false;
            return;
        }
        submissionObservable = this.http.post(genericSubmitEndpoint, payload);
      }

      console.log('Submission Payload:', payload);

      submissionObservable.subscribe({
        next: (response) => {
          console.log('Form submitted successfully:', response);
          this.alertService.showGeneral({
            messages: [
              this.translate.instant('pages.home_form.success.claim_submitted'),
            ],
          });
          this.resetForm();
          this.isLoadingSubmit = false;
          this.router.navigate([
            `/${this.authService.getCurrentLang()}/claims`,
          ]);
        },
        error: (error) => {
          console.error('Submission error:', error);
          this.alertService.showGeneral({
            messages: [
              this.translate.instant(
                'pages.home_form.errors.submission_failed'
              ),
            ],
            buttonLabel: this.translate.instant('pages.home_form.errors.login'),
            redirectRoute: `/${this.authService.getCurrentLang()}/login`,
          });
          this.isLoadingSubmit = false;
        },
      });
    } else {
      const invalidFields: { [key: string]: any } = {};
      Object.keys(this.claimForm.controls).forEach((key) => {
        const control = this.claimForm.get(key);
        if (control?.invalid) {
          invalidFields[key] = {
            value: control.value,
            errors: control.errors,
          };
        }
      });
      console.warn('Form is invalid. Invalid fields:', invalidFields);
      this.markFormGroupTouched();
      console.warn('Form is invalid. Please check the fields.');
    }
  }

  private resetForm(): void {
    this.claimForm.reset();
    this.currentStep = 1;
    this.isManualPolicy = false;
    this.prefillUserData();
    this.updateFormFields();
    this.carTypes = [];
    this.carBrands = [];
    this.carModels = [];
    this.carYears = [];
    this.motorInsurances = [];
    this.medicalInsurances = [];
    this.buildingTypes = [];
    this.buildingCountries = [];
    this.filteredBuildingCountries = [];
    this.buildingInsurances = [];
  }

  private markFormGroupTouched(): void {
    Object.keys(this.claimForm.controls).forEach((key) => {
      const control = this.claimForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.claimForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required'])
        return this.translate.instant(
          `pages.home_form.errors.${fieldName}_required`
        );
      if (field.errors['email'])
        return this.translate.instant('pages.home_form.errors.email_invalid');
      if (field.errors['minlength'])
        return this.translate.instant(
          `pages.home_form.errors.${fieldName}_minlength`,
          { length: field.errors['minlength'].requiredLength }
        );
      if (field.errors['pattern']) {
        if (fieldName === 'phoneNumber')
          return this.translate.instant('pages.home_form.errors.phone_invalid');
        if (fieldName === 'birthdate')
          return this.translate.instant(
            'pages.home_form.errors.birthdate_invalid'
          );
        if (fieldName === 'car_year')
          return this.translate.instant(
            'pages.home_form.errors.car_year_invalid'
          );
        if (
          fieldName === 'car_price' ||
          fieldName === 'building_price' ||
          fieldName === 'jop_price'
        )
          return this.translate.instant(
            'pages.home_form.errors.car_price_invalid'
          );
        return this.translate.instant(
          `pages.home_form.errors.${fieldName}_invalid`
        );
      }
      if (
        field.errors['min'] &&
        (fieldName === 'car_price' || fieldName === 'building_price')
      ) {
        return this.translate.instant('pages.home_form.errors.price_min', {
          min: 500000,
        });
      }
      if (field.errors['min'] && fieldName === 'jop_price') {
        return this.translate.instant('pages.home_form.errors.price_min', {
          min: 50000,
        });
      }
      if (field.errors['max'] && fieldName === 'jop_price') {
        return this.translate.instant('pages.home_form.errors.price_max', {
          max: 1000000,
        });
      }
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    return this.translate.instant(`pages.home_form.fields.${fieldName}`);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.claimForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Job claim specific methods
  onJobTitleChange(event: any): void {
    const selectedValue = event.target.value;
    const othersOption =
      this.translate.currentLang === 'ar' ? 'آخرون' : 'Others';
    this.showCustomJobTitle = selectedValue === othersOption;

    if (this.showCustomJobTitle) {
      this.claimForm
        .get('custom_jop_title')
        ?.setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      this.claimForm.get('custom_jop_title')?.clearValidators();
      this.claimForm.get('custom_jop_title')?.setValue('');
    }
    this.claimForm.get('custom_jop_title')?.updateValueAndValidity();
  }

  onMainIdFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedMainIdFile = file;
      this.claimForm.get('jop_main_id')?.setValue(file.name);
      this.claimForm.get('jop_main_id')?.markAsTouched();
    }
  }

  onSecondIdFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedSecondIdFile = file;
      this.claimForm.get('jop_second_id')?.setValue(file.name);
    }
  }

  triggerFileInput(inputId: string): void {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    fileInput?.click();
  }

  private createJobClaimFormData(payload: any): FormData {
    const formData = new FormData();

    // Add all text fields
    Object.keys(payload).forEach((key) => {
      if (
        key !== 'jop_main_id' &&
        key !== 'jop_second_id' &&
        payload[key] !== null &&
        payload[key] !== undefined
      ) {
        formData.append(key, payload[key].toString());
      }
    });

    // Add file uploads
    if (payload.jop_main_id instanceof File) {
      formData.append('jop_main_id', payload.jop_main_id);
    }
    if (payload.jop_second_id instanceof File) {
      formData.append('jop_second_id', payload.jop_second_id);
    }

    return formData;
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }
  private formatDateToYMD(dateString: string): string {
    if (!dateString) return '';

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If in DD-MM-YYYY format, convert to YYYY-MM-DD
    const parts = dateString.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY or DD/MM/YYYY format
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[0].length === 4 && parts[2].length === 2) {
        // YYYY-MM-DD format (but might have wrong separator)
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
    }

    return dateString; // fallback
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

  preventNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (!isNaN(Number(key)) && key !== ' ') {
      event.preventDefault();
    }
  }
  // Update the restrictToLetters method
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

  // Add a new method to restrict phone numbers to Egyptian format
  restrictToEgyptianPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    // Ensure the number starts with 010, 011, 012, or 015 and is 11 digits
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    if (!/^(010|011|012|015)/.test(value)) {
      value = '';
    }
    input.value = value;
    this.claimForm.get('phoneNumber')?.setValue(value);
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
}
