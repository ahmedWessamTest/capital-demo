import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.handleRouterEvents();
  }

  private handleRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const segments = url.split('/');
        const routeLang = segments[1] || 'en';

        console.log('Current URL:', url);
        console.log('Language detected:', routeLang);

        this.setLanguage(routeLang);

        let currentRoute = this.route.root;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        const titleKey = currentRoute.snapshot.data['titleKey'];
        if (titleKey) {
          this.translate.get(titleKey).subscribe((translatedTitle) => {
            const finalTitle = translatedTitle.toUpperCase();
            this.title.setTitle(finalTitle);
          });
        }
      });
  }

  setLanguage(lang: string): void {
    if (this.translate.currentLang !== lang) {
      if (isPlatformBrowser(this.platformId)) {
        this.spinner.show("spinner");
      }
      this.translate.use(lang).subscribe(() => {
        this.currentLanguageSubject.next(lang);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('language', lang);
          this.setDocumentDirection(lang);
          this.spinner.hide("spinner");
        }
      });
    } else {
      this.currentLanguageSubject.next(lang);
      if (isPlatformBrowser(this.platformId)) {
        this.setDocumentDirection(lang);
      }
    }
  }

  private setDocumentDirection(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const direction = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', lang);
      document.body.setAttribute('dir', direction);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  changeLanguage(lang: string, currentUrl: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.spinner.show("spinner");
    }
    const segments = currentUrl.split('/');
    if (segments.length > 1) {
      segments[1] = lang;
      if (segments.includes('blog') || segments.includes('english-blogs') || segments.includes('arabic-blogs')) {
        segments.splice(2);
        segments.push(lang === 'en' ? 'english-blogs' : 'arabic-blogs');
      }
    } else {
      segments.push(lang, lang === 'en' ? 'english-blogs' : 'arabic-blogs');
    }
    this.router.navigateByUrl(segments.join('/'));
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.spinner.hide("spinner");
      }, 1500);
    }
  }
}