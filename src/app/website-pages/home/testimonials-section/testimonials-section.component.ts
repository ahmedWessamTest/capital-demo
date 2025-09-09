import { Component, ViewChild, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselModule, OwlOptions, SlidesOutputData, CarouselComponent } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { HeadingComponent } from "@core/shared/heading/heading.component";
import { API_CONFIG } from '@core/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { Testimonial, UpdatedGenericDataService } from '@core/services/updated-general.service';
interface LocalTestimonial {
  id: string;
  en_name: string;
  ar_name: string;
  en_job: string;
  ar_job: string;
  en_text: string;
  ar_text: string;
  imageSrc: string;
  imageAlt: string;
}

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule, CarouselModule, HeadingComponent, TranslateModule],
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class TestimonialsSectionComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('owlTestimonials') owlTestimonials!: CarouselComponent;
  @Input() testimonialsData: Testimonial[] = [];
  testimonials: LocalTestimonial[] = [];
  currentLanguage: string = 'en';
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    smartSpeed: 700,
    margin: 20,
    center: true,
    nav: false,
    autoWidth: false,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2
      }

    },
    rtl: false
  };

  activeTestimonialIndex = 0;
  private languageSubscription!: Subscription;
  private testimonialsSubscription!: Subscription;

  constructor(
    private languageService: LanguageService,
    private genericDataService: UpdatedGenericDataService
  ) { }

  ngOnInit(): void {
    console.log(this.testimonials);

    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateCarouselDirection(lang);
    });

    if (!this.testimonialsData.length) {
      this.testimonialsSubscription = this.genericDataService.testimonials$.subscribe(data => {
        if (data) {
          this.testimonialsData = data;
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.testimonials = changes?.["testimonialsData"].currentValue
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.testimonialsSubscription) {
      this.testimonialsSubscription.unsubscribe();
    }
  }

  private updateCarouselDirection(lang: string): void {
    const isRtl = lang === 'ar';
    if (this.customOptions.rtl !== isRtl) {
      this.customOptions = { ...this.customOptions, rtl: isRtl };
      if (this.owlTestimonials) {
        const currentSlideId = this.testimonials[this.activeTestimonialIndex]?.id || this.testimonials[0].id;
        this.owlTestimonials.to(currentSlideId);
      }
    }
  }

  getData(data: SlidesOutputData) {
    if (data && data.startPosition !== undefined) {
      this.activeTestimonialIndex = data.startPosition;
      this.announceSlideChange(this.testimonials[this.activeTestimonialIndex].id);
    }
  }

  moveToSlide(carousel: CarouselComponent, id: string) {
    carousel.to(id);
    this.announceSlideChange(id);
  }

  platformId = inject(PLATFORM_ID);

  private announceSlideChange(slideId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const liveRegion = document.getElementById('testimonial-live-region');
      if (liveRegion) {
        const slideIndex = this.testimonials.findIndex(t => t.id === slideId);
        if (slideIndex !== -1) {
          liveRegion.textContent = `Now viewing testimonial ${slideIndex + 1} of ${this.testimonials.length} by ${this.currentLanguage === 'en' ? this.testimonials[slideIndex].en_name : this.testimonials[slideIndex].ar_name}.`;
        }
      }
    }
  }

  // Getters for language-specific rendering
  getName(testimonial: LocalTestimonial): string {
    return this.currentLanguage === 'en' ? testimonial.en_name : testimonial.ar_name;
  }

  getPosition(testimonial: LocalTestimonial): string {
    return this.currentLanguage === 'en' ? testimonial.en_job : testimonial.ar_job;
  }

  getText(testimonial: LocalTestimonial): string {
    return this.currentLanguage === 'en' ? testimonial.en_text : testimonial.ar_text;
  }
}
