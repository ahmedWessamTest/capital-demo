import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { SafeHtmlPipe } from '@core/pipes/safe-html.pipe';
import {
  UserData,
} from '@core/services/auth/auth-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import {
  JopPolicyService,
} from '@core/services/policies/jop-policy.service';
import {
  Counter,
  UpdatedGenericDataService,
} from '@core/services/updated-general.service';
import { AlertService } from '@core/shared/alert/alert.service';
import {
} from '@core/shared/policy-drop-down/policy-drop-down.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PartnersLogosComponent } from '../parteners-logos/parteners-logos.component';
import { JopCategory, JopInsurance } from './res/JobInsurancePolicy';
import { JobIndividualFormComponent } from './individual-form/job-individual-form.component';
import { JobCorporateFormComponent } from "./job-corporate-form/job-corporate-form.component";
import { LeadTypeConfig, LeadTypeSelectorComponent } from "@core/shared/lead-type-selector/lead-type-selector.component";

@Component({
  selector: 'app-job-insurance',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SafeHtmlPipe,
    PartnersLogosComponent,
    JobIndividualFormComponent,
    JobCorporateFormComponent,
    LeadTypeSelectorComponent
  ],
  templateUrl: './job-insurance.component.html',
  styleUrl: './job-insurance.component.css',
})
export class JobInsuranceComponent {
  showForm = false;
  showPlans = false;
  showSelectLead: boolean = false
  private languageSubscription!: Subscription;
  private alertSubscription!: Subscription;
  counters: Counter[] = [];
  platformId = inject(PLATFORM_ID);
  isTextContentLoading = true;
  isImageLoading = false;
  imageLoaded = false;
  plans: JopInsurance[] = [];
  category: JopCategory | null = null;
  leadType: 'corporate' | 'individual' | null = null;
  userSelectedLead: 'corporate' | 'individual' = 'individual';

  constructor(
    private authService: AuthService,
    private jopPolicyService: JopPolicyService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private alertService: AlertService,
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title
  ) {


    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang) => {
        this.cdr.markForCheck();
        this.currentLanguage = lang;
      }
    );

    this.genericDataService.getCounters().subscribe((data) => {
      this.counters = data.filter((counter) => counter.id === 5);
      this.cdr.markForCheck();
    });


  }
  currentLanguage: string = 'en';
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
  ngOnInit(): void {
    this.isTextContentLoading = true;
    this.isImageLoading = false; // Initialize to false to trigger image load immediately
    this.imageLoaded = false;

    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      const userData: UserData | null = this.authService.getUserData();
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



  scrollToForm(): void {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const formElement = document.getElementById('lead-type-choice');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
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
  onLeadTypeSelected(value: any): void {
    this.userSelectedLead = value;
  }
  selectFrom() {
    this.leadType = this.userSelectedLead;
    this.showSelectLead = false;
  }
}
