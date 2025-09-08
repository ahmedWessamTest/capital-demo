

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, QueryList, ViewChildren, AfterViewInit, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GovernorateOption } from '@core/shared/policy-drop-down/policy-drop-down.component';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { Router } from '@angular/router';
import { MedicalInsurance, MedicalCategory, MedicalInsuranceService, MedicalPolicyData } from '@core/services/policies/medical-policy.service';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';

import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';
import { PartnersLogosComponent } from "../parteners-logos/parteners-logos.component";
import { Meta, Title } from '@angular/platform-browser';
import { MedicalIndividualFormComponent } from "./medical-individual-form/medical-individual-form.component";
import { MedicalCorporateFormComponent } from "./medical-corporate-form/medical-corporate-form.component";
import { LeadTypeConfig, LeadTypeSelectorComponent } from "@core/shared/lead-type-selector/lead-type-selector.component";

@Component({
  selector: 'app-medical-policy',
  standalone: true,
  imports: [
    CommonModule,
    SafeHtmlPipe,
    ReactiveFormsModule,
    CarouselModule,
    TranslateModule,
    PartnersLogosComponent,
    MedicalIndividualFormComponent,
    MedicalCorporateFormComponent,
    LeadTypeSelectorComponent
  ],
  templateUrl: './medical-policy.component.html',
  styleUrls: ['./medical-policy.component.css']
})
export class MedicalPolicyComponent implements OnInit, OnDestroy, AfterViewInit {
  showForm = false;
  step = 0;
  progress = 20;
  selectedPlan: MedicalInsurance | null = null;
  leadId: number | null = null;
  isLoading = false; // Updated to false initially
  isTextContentLoading = true; // New property for text loading state
  isImageLoading = false; // New property for image loading state
  imageLoaded = false; // New property to track image load status
  isNeedCallLoading = false;
  showPlans = false;
  counters: Counter[] = [];
  userSelectedLead: 'corporate' | 'individual' = 'individual';
  leadType: 'corporate' | 'individual' | null = null;
  showSelectLead: boolean = false
  leadTypeConfig: LeadTypeConfig = {
    title: 'pages.professional_indemnity.form.lead_type.can_i_know',
    subtitle: 'pages.professional_indemnity.form.lead_type.individual_or_corporate',
    description: 'pages.professional_indemnity.form.lead_type.because_it_will_make_a_big_different_in_your_steps',
    nextButtonText: 'pages.professional_indemnity.form.lead_type.next_button',
    options: [
      {
        value: 'individual',
        translationKey: 'pages.professional_indemnity.form.lead_type.individual'
      },
      {
        value: 'corporate',
        translationKey: 'pages.professional_indemnity.form.lead_type.corporate'
      }
    ]
  };
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

  goBack() {
    history.back();
  }
  constructor(
    private medicalInsuranceService: MedicalInsuranceService,
    public translate: TranslateService,
    public languageService: LanguageService,
    private alertService: AlertService,
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title
  ) {
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
    this.isTextContentLoading = true;
    this.isImageLoading = false; // Initialize to false to trigger image load immediately
    this.imageLoaded = false;
    this.genericDataService.getCounters().subscribe(data => {
      this.counters = data.filter((counter: Counter) => counter.id === 7);
      this.cdr.markForCheck();
    });

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
        this.isTextContentLoading = false;
      }),
      catchError(err => {
        console.error('Error fetching medical data:', err);
        this.alertService.showNotification({
          translationKeys: { message: 'pages.medical_policy.errors.data_fetch_failed' }
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

  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

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

  onLeadTypeSelected(value: any): void {
    this.userSelectedLead = value;
  }
  selectFrom() {
    this.leadType = this.userSelectedLead;
    this.showSelectLead = false;
  }
}
