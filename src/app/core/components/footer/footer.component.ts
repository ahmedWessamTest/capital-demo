import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UpdatedGenericDataService } from '@core/services/updated-general.service';
import { ChangeDetectorRef } from '@angular/core';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule,PhoneFormatPipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  lang: string = 'en';
  aboutDownload: any = null;
  isLoading: boolean = true; // Added for skeleton loading

  private languageService = inject(LanguageService);
  private genericDataService = inject(UpdatedGenericDataService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  footerData = {
    title: '', // Will be populated by translation
    description: '',
    companyInfo: '',
    downloadapp: '',
    contact: {
      email: '',
      en_address: '',
      ar_address: '',
      phone1: '',
      phone2: '',
      phone3: '',
      phone4: '',
      whatsapp: ''
    },
    navigation: [
      { en_name: 'Home Page ', ar_name: 'الرئيسية', path: 'home' },
      { en_name: 'About Us', ar_name: 'معلومات عنا', path: 'about' },
      { en_name: 'Claims', ar_name: 'المطالبات', path: 'claims-info' },
      { en_name: 'Blogs', ar_name: 'المدونات', path: this.lang === 'en' ? 'english-blogs' : 'arabic-blogs' },
      { en_name: 'Get in touch', ar_name: 'اتصل بنا', path: 'contact' }
    ],
    socialLinks: [
      { name: 'Facebook', url: '#', icon: '/assets/footer/facebook.svg' },
      { name: 'Instagram', url: '#', icon: '/assets/footer/insta.svg' },
      { name: 'Twitter', url: '#', icon: '/assets/footer/x.svg' },
      { name: 'LinkedIn', url: '#', icon: '/assets/footer/lin.svg' }
    ],
    copyright: {
      year: new Date().getFullYear(),
      company: ''
    }
  };

  ngOnInit(): void {
    // Subscribe to language changes
    this.subscription.add(
      this.languageService.currentLanguage$.subscribe(lang => {
        this.lang = lang;
        this.cdr.markForCheck(); // Trigger change detection        // Update blog path based on language
        this.footerData.navigation[3].path = lang === 'en' ? 'english-blogs' : 'arabic-blogs';
      })
    );

    // Subscribe to contact data
    this.subscription.add(
      this.genericDataService.contactData$.subscribe(data => {
        if (data?.contact && isPlatformBrowser(this.platformId)) {
          this.footerData.contact = {
            email: data.contact.email,
            en_address: data.contact.en_address,
            ar_address: data.contact.ar_address,
            phone1: data.contact.first_phone,
            phone2: data.contact.second_phone,
            phone3: data.contact.third_phone,
            phone4: data.contact.fourth_phone,
            whatsapp: data.contact.whatsapp
          };
          this.footerData.socialLinks = [
            { name: 'Facebook', url: data.contact.facebook || '#', icon: '/assets/footer/facebook.svg' },
            { name: 'Instagram', url: data.contact.instagram || '#', icon: '/assets/footer/insta.svg' },
            { name: 'Twitter', url: data.contact.twitter || '#', icon: '/assets/footer/x.svg' },
            { name: 'LinkedIn', url: data.contact.linkedin || '#', icon: '/assets/footer/lin.svg' }
          ];
          this.isLoading = false; // API data loaded, hide skeleton
        }
      })
    );

    // Subscribe to about download data for app store link
    this.subscription.add(
      this.genericDataService.aboutDownload$.subscribe(data => {
        if (data && isPlatformBrowser(this.platformId)) {
          this.aboutDownload = data;
          this.isLoading = false; // API data loaded, hide skeleton
        }
      })
    );

    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}