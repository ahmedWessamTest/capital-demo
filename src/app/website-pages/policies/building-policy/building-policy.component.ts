
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GovernorateOption } from '@core/shared/policy-drop-down/policy-drop-down.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/services/language.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { BuildingCategory, BuildingInsuranceService } from '@core/services/policies/building-policy.service';

import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { PartnersLogosComponent } from "../parteners-logos/parteners-logos.component";
import { Meta, Title } from '@angular/platform-browser';
import { BuildingIndividualFormComponent } from "./building-individual-form/building-individual-form.component";
import { LeadTypeConfig, LeadTypeSelectorComponent } from '@core/shared/lead-type-selector/lead-type-selector.component';
import { BuildingCorporateFormComponent } from "./building-corporate-form/building-corporate-form.component";

@Component({
  selector: 'app-building-policy',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CarouselModule,
    TranslateModule,
    SafeHtmlPipe,
    PartnersLogosComponent,
    BuildingIndividualFormComponent,
    LeadTypeSelectorComponent,
    BuildingCorporateFormComponent
  ],
  templateUrl: './building-policy.component.html',
  styleUrls: ['./building-policy.component.css']
})
export class BuildingPolicyComponent implements OnInit, OnDestroy {
  showForm = false;
  leadId: number | null = null;
  isLoading = false;
  isContentLoading = true;
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
  counters: Counter[] = [];
  platformId = inject(PLATFORM_ID);
  isTextContentLoading = true;
  isImageLoading = false;
  imageLoaded = false;

  countries: GovernorateOption[] = [];
  category: BuildingCategory | null = null;
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

  steps = [
    { en_title: 'Personal Information', ar_title: 'المعلومات الشخصية', formFields: ['name', 'phone', 'email'] },
    { en_title: 'Building Type', ar_title: 'نوع المبنى', formFields: ['buildType'] },
    { en_title: 'Country', ar_title: 'البلد', formFields: ['country'] },
    { en_title: 'Building Value', ar_title: 'قيمة المبنى', formFields: ['buildingValue'] },
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
    rtl: false
  };

  constructor(
    private buildingInsuranceService: BuildingInsuranceService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private alertService: AlertService,
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef
    , private meta: Meta,
    private title: Title,
  ) {

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.cdr.markForCheck()
      this.updateCarouselDirection(lang);
      this.currentLanguage = lang;
    });

    this.genericDataService.getCounters().subscribe(data => {
      console.log(data)
      this.counters = data.filter(counter => counter.id === 5);
      this.cdr.markForCheck()
    });

  }
  currentLanguage: string = 'en';



  ngOnInit(): void {
    this.isTextContentLoading = true;
    this.isImageLoading = false; // Initialize to false to trigger image load immediately
    this.imageLoaded = false;
    this.buildingInsuranceService.fetchBuildingData().pipe(
      tap(data => {
        this.category = data.category;

        const metaTitle = this.translate.currentLang === 'ar' ? data.category.ar_meta_title : data.category.en_meta_title;
        const metaDescription = this.translate.currentLang === 'ar' ? data.category.ar_meta_description : data.category.en_meta_description;
        this.title.setTitle(metaTitle);
        this.meta.updateTag({ name: 'description', content: metaDescription });
        this.cdr.markForCheck();
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

    this.genericDataService.getCounters().subscribe(data => {
      this.counters = data.filter(counter => counter.id === 5);
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
      translationKeys: { message: 'pages.building_policy.errors.image_load_failed' }
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

  goBack() {
    history.back();
  }



  onLeadTypeSelected(value: any): void {
    this.userSelectedLead = value;
  }
  selectFrom() {
    this.leadType = this.userSelectedLead;
    this.showSelectLead = false;
  }
}
