import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, signal, ChangeDetectionStrategy } from '@angular/core';
import { OwlOptions, CarouselModule, CarouselComponent } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-parteners-section',
  standalone: true,
  imports: [CommonModule, CarouselModule, TranslateModule],
  templateUrl: './parteners-section.component.html',
  styleUrls: ['./parteners-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class PartenersSectionComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('owlCarousel', { static: false }) owlCarousel!: CarouselComponent;
  @Input() partners: { en_name: string; ar_name: string; image: string; alt: string }[] = [];

  partnerCategories: { en_name: string; ar_name: string; image: string; alt: string }[] = [];
  isLoading = signal(true); // Initialize to true to show skeleton on initial load
  lang = signal('en');
  carouselOptions: OwlOptions = {
    loop: true,
    nav: false,
    dots: false,
    mouseDrag: true,
    touchDrag: true,
      stagePadding: 20,
    pullDrag: true,
    // autoplay: true,
    // autoplayTimeout: 3000,
    // autoplaySpeed: 1000,
    center: true,
    autoWidth: true,
    smartSpeed: 600,
    margin: 18,
    rtl: false,
    responsive: {
      0: { items: 1 },
      300: { items: 3 },
      400: { items: 4 },
      600: { items: 5 },
      700: { items: 7 }
    }
  };

  private languageSubscription!: Subscription;

  constructor(private languageService: LanguageService) { }
  goToSlide(id:string) {    
    this.owlCarousel.to(id)
  }
  ngOnInit(): void {
    this.updatePartnerCategories();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.updateCarouselDirection(lang);
      this.lang.set(lang);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['partners']) {
      this.isLoading.set(true); // Show skeleton when partners input changes
      // Simulate data loading delay if necessary, otherwise remove setTimeout
      setTimeout(() => {
        this.updatePartnerCategories();
        this.isLoading.set(false); // Hide skeleton after data is processed
      }, 500); // Adjust delay as needed
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * Updates partnerCategories based on input partners
   */
  private updatePartnerCategories(): void {
    this.partnerCategories = this.partners.length > 0
      ? this.partners
      : [
        { en_name: 'Partner 1', ar_name: 'Partner 1', image: '/assets/parteners/1.png', alt: 'Partner 1 Logo' },
      ];
    // If partners are available on initial load, hide skeleton
    if (this.partners.length > 0 && this.isLoading()) {
      this.isLoading.set(false);
    }
  }

  /**
   * Updates the carousel's direction (RTL/LTR) based on the current language.
   * Forces a re-render of the carousel if the direction changes.
   * @param lang The current language code.
   */
  private updateCarouselDirection(lang: string): void {
    const isRtl = lang === 'ar';
    if (this.carouselOptions.rtl !== isRtl) {
      this.carouselOptions = { ...this.carouselOptions, rtl: isRtl };
      if (this.owlCarousel) {
        this.owlCarousel.to('0');
      }
    }
  }

  /**
   * Navigates the carousel to the previous slide.
   */
  prev(): void {
    if (this.owlCarousel) {
      this.owlCarousel.prev();
    }
  }

  /**
   * Navigates the carousel to the next slide.
   */
  next(): void {
    if (this.owlCarousel) {
      this.owlCarousel.next();
    }
  }

  // Expose isRTL from the service to the template for conditional styling/icons
  get isRtl(): boolean {
    return this.languageService.isRTL();
  }
}