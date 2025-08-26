import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs'; // Import combineLatest
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AboutDataResponse, UpdatedGenericDataService, Feature } from '@core/services/updated-general.service';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { HeadingComponent } from "@core/shared/heading/heading.component";
import { TranslateModule } from '@ngx-translate/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  imports: [CommonModule, HeadingComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit, OnDestroy, OnChanges {
  aboutData$: Observable<AboutDataResponse | null>;
  isArabic: boolean = false;
  @Input() isHome: boolean = false;
  baseImageUrl: string = API_CONFIG.BASE_URL_IMAGE;
  private destroy$ = new Subject<void>();
  lang: string = 'en';

  constructor(
    private genericDataService: UpdatedGenericDataService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    this.aboutData$ = this.genericDataService.aboutData$;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isHome']) {
      console.log('isHome changed:', this.isHome);
    }
  }

  ngOnInit(): void {
    // Combine language and about data to update meta tags dynamically
    combineLatest([this.languageService.currentLanguage$, this.genericDataService.getAboutData()])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([language, data]) => {
          this.lang = language;
          this.isArabic = language === 'ar';
          this.cdr.markForCheck();
          // Only update meta tags if on the /about route and not on homepage
          if (data && !this.isHome && this.router.url.includes('/about')) {
            const metaTitle = this.isArabic ? data.about.ar_meta_title : data.about.en_meta_title;
            const metaDescription = this.isArabic ? data.about.ar_meta_description : data.about.en_meta_description;
            this.title.setTitle(metaTitle);
            this.meta.updateTag({ name: 'description', content: metaDescription });
          }
        },
        error: (err) => console.error('Error in language or about data subscription:', err)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const parent = imgElement.parentElement;
    if (parent) {
      const skeleton = parent.querySelector('.image-skeleton');
      if (skeleton) {
        skeleton.classList.add('hidden');
      }
    }
  }
}