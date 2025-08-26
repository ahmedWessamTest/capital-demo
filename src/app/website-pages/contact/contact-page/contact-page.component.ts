import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactDataResponse, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { ContactFormErrors, ContactService } from '@core/services/contact.service';
import { Router } from '@angular/router';
import { AlertService } from '@core/shared/alert/alert.service';
import { LanguageService } from '@core/services/language.service';
import { Meta, Title } from '@angular/platform-browser';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,PhoneFormatPipe],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css',
  animations: [
    trigger('skeletonAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms 300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
    trigger('cardsAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms 300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
  ],
})
export class ContactPageComponent implements OnInit {
  contactForm!: FormGroup;
  contactData: ContactDataResponse | null = null;
  isLoading = signal(true);
  isMapLoading = signal(true);
  isImageLoading = signal(true);
  formErrors = signal<ContactFormErrors | null>(null);
  formSuccess = signal<string | null>(null);
  isSubmitting = signal(false);
  private contactDataSubscription!: Subscription;
  lang: string = 'en';

  constructor(
    private genericDataService: UpdatedGenericDataService,
    private contactService: ContactService,
    public translate: TranslateService,
    private alertService: AlertService,
    private router: Router,
    private languageService: LanguageService,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchContactData();
    combineLatest([this.languageService.currentLanguage$, this.genericDataService.getContactData()]).subscribe({
      next: ([lang, data]) => {
        this.lang = lang;
        if (data && this.router.url.includes('/contact')) {
          const metaTitle = lang === 'ar' ? data.contact.ar_meta_title : data.contact.en_meta_title;
          const metaDescription = lang === 'ar' ? data.contact.ar_meta_description : data.contact.en_meta_description;
          this.title.setTitle(metaTitle);
          this.meta.updateTag({ name: 'description', content: metaDescription });
        }
      },
      error: (err) => console.error('Error in language or contact data subscription:', err),
    });
    setTimeout(() => {
      this.isMapLoading.set(false);
    }, 2000);
  }

  private initForm(): void {
    this.contactForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-z\s]+$/), // Only letters and spaces allowed
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]),
      message: new FormControl('', [Validators.required, Validators.minLength(10)]),
    });
  }

  private fetchContactData(): void {
    this.contactDataSubscription = this.genericDataService.getContactData().subscribe({
      next: (data) => {
        this.contactData = data;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching contact data:', err);
        this.isLoading.set(false);
      },
    });
  }

  preventNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (!isNaN(Number(key)) && key !== ' ') {
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
      this.contactForm.get('name')?.setValue(filteredValue);
    }
  }
  RestirctToNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    // Remove any numbers from the input value
    const filteredValue = value.replace(/[^0-9]/g, '');
    if (value !== filteredValue) {
      input.value = filteredValue;
      this.contactForm.get('phone')?.setValue(filteredValue);
    }
  }

  onMapLoad(): void {
    this.isMapLoading.set(false);
  }

  onImageLoad(): void {
    this.isImageLoading.set(false);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.formErrors.set(null);
    this.formSuccess.set(null);

    const payload = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone,
      message: this.contactForm.value.message,
    };

    this.contactService.submitContactForm(payload).subscribe({
      next: (response) => {
        if (response.errors) {
          this.formErrors.set(response.errors);
        } else if (response.success) {
          this.alertService.showGeneral({
            title: this.translate.instant('pages.contact.form_success'),
            messages: [
              this.translate.instant('pages.contact.form_success_message'),
              this.translate.instant('pages.contact.form_thanks'),
            ],
            buttonLabel: this.translate.instant('pages.contact.back_to_home'),
            redirectRoute: '/' + this.lang + '/home',
          });
          this.contactForm.reset();
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error submitting contact form:', err);
        this.formErrors.set({
          message: [this.translate.instant('contact.form_error')],
        });
        this.isSubmitting.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.contactDataSubscription) {
      this.contactDataSubscription.unsubscribe();
    }
  }

  getDirection(): string {
    return this.translate.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
  
  encodeAddress(address:string):string {
    return encodeURIComponent(address)
  }
}