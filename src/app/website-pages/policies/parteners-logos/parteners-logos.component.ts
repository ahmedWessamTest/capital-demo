import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { UpdatedGenericDataService } from '@core/services/updated-general.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-partners-logos',
  standalone: true,
  imports: [CarouselModule, CommonModule, TranslateModule],
  templateUrl: './parteners-logos.component.html',
  styleUrls: ['./parteners-logos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnersLogosComponent implements OnInit, OnDestroy {
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;
  @Input() policyType: 'medical' | 'motor' | 'property' | 'job' | null = null;

  isRtl = false;
  private languageSubscription!: Subscription;
  private dataSubscription!: Subscription;

  partners = signal<
    {
      en_name: string;
      ar_name: string;
      image: string;
      alt: string;
      id: number;
      category_id?: number;
    }[]
  >([]);

  isImageLoaded: Record<number, boolean> = {};
  isLoading = true;

  readonly IMAGE_BASE_URL = API_CONFIG.BASE_URL_IMAGE;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    margin: 48,
    navSpeed: 700,
    smartSpeed: 700,
    autoplay: true,
    autoWidth: false,
    navText: ['', ''],
    center: false,
    nav: false,
    rtl: this.isRtl,
    skip_validateItems: true,
    autoplayTimeout: 3000,
    autoplaySpeed: 700,
    stagePadding: 0,
    slideBy: 1,
    responsive: {
      0: { items: 1, margin: 12 },
      500: { items: 3, margin: 12 },
    },
  };

  constructor(
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
    private dataService: UpdatedGenericDataService
  ) {}

  ngOnInit(): void {
    // اللغة
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang) => {
        this.isRtl = lang === 'ar';
        this.customOptions = { ...this.customOptions, rtl: this.isRtl };
        this.cdr.markForCheck();
      }
    );

    // تحميل الداتا
    if (this.policyType) {
      this.loadPartnersData(this.policyType);
    }
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  private loadPartnersData(policyType: 'medical' | 'motor' | 'property' | 'job'): void {
    this.isLoading = true;
    const categoryIdMap: Record<string, number> = {
      medical: 1,
      motor: 2,
      property: 3,
      job: 5,
    };

    const categoryId = categoryIdMap[policyType];
    if (!categoryId) return;

    this.dataSubscription = this.dataService
      .getSingleCategory(categoryId)
      .subscribe({
        next: (res) => {
          const mapped = (res.category.partners ?? []).map((partner: any) => ({
            ar_name: partner.ar_partner_name,
            en_name: partner.en_partner_name,
            image: this.IMAGE_BASE_URL + partner.partner_image,
            alt: `${partner.en_partner_name} Logo`,
            id: partner.id,
            category_id: partner.category_id,
          }));

          this.partners.set(mapped);
          this.isImageLoaded = {};
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching partners:', err);
          this.partners.set([]);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onImageLoad(partnerId: number): void {
    this.isImageLoaded[partnerId] = true;
    this.cdr.markForCheck();
  }

  onImageError(partnerId: number): void {
    this.isImageLoaded[partnerId] = false;
    console.warn(`Failed to load image for partner ${partnerId}`);
    this.cdr.markForCheck();
  }

  shouldShowLoading(partnerId: number): boolean {
    return !this.isImageLoaded[partnerId];
  }
}
