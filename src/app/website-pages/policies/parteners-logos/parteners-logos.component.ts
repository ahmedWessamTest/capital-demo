import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { UpdatedGenericDataService } from '@core/services/updated-general.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
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

  isRtl: boolean = false;
  private languageSubscription!: Subscription;
  private dataSubscription!: Subscription;
  private policyTypeSubject = new BehaviorSubject<
    'medical' | 'motor' | 'property' | 'job' | null
  >(null);
  isImageLoaded: { [key: number]: boolean } = {};
  partners: {
    en_name: string;
    ar_name: string;
    image: string;
    alt: string;
    id: number;
    category_id?: number;
  }[] = [];
  isLoading: boolean = true;
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
    autoWidth: false,
    navText: ['', ''],
    center: false,
    nav: false,
    rtl: this.isRtl,
    skip_validateItems: true,
    autoplay: true,
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
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (lang) => {
        this.isRtl = lang === 'ar';
        this.customOptions = { ...this.customOptions, rtl: this.isRtl };
        this.cdr.markForCheck();
      }
    );

    this.dataSubscription = combineLatest([
      this.dataService.partners$,
      this.policyTypeSubject,
    ]).subscribe(([partners, policyType]) => {
      console.log('PolicyType:', policyType);
      console.log('Partners from service:', partners);

      // Map and filter partners based on policyType
      let filteredPartners = partners || [];
      if (policyType) {
        const categoryIdMap: { [key: string]: number } = {
          medical: 1,
          motor: 2,
          property: 3,
          job: 5,
        };
        const categoryId = categoryIdMap[policyType];
        filteredPartners = filteredPartners.filter(
          (partner) => partner.category_id === categoryId
        );
      }

      this.partners = filteredPartners.map((partner) => ({
        ar_name: partner.ar_partner_name,
        en_name: partner.en_partner_name,
        image: this.IMAGE_BASE_URL + partner.partner_image,
        alt: `${partner.en_partner_name} Logo`,
        id: partner.id,
        category_id: partner.category_id, // Include category_id if needed elsewhere
      }));

      console.log('Filtered and mapped partners length:', this.partners.length);
      this.isImageLoaded = {};
      this.isLoading = false;
      this.cdr.markForCheck();
    });

    this.loadPartnersData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['policyType']) {
      console.log('PolicyType changed to:', this.policyType);
      this.policyTypeSubject.next(this.policyType);
      this.loadPartnersData();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private loadPartnersData(): void {
    this.isLoading = true;
    this.dataService.getPartners().subscribe({
      error: (err) => {
        console.error('Error fetching partners:', err);
        this.isLoading = false;
        this.partners = [];
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
