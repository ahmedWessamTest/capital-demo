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
  en_position: string;
  ar_position: string;
  en_text: string;
  ar_text: string;
  imageSrc: string;
  imageAlt: string;
}

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule, CarouselModule, HeadingComponent,TranslateModule],
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
    margin:20,
    center: true,
    nav: false,
    autoWidth: false,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items:2
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
  ) {}

  ngOnInit(): void {
    this.updateTestimonials();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateCarouselDirection(lang);
      this.updateTestimonials(); // Refresh to update language-specific fields
    });

    if (!this.testimonialsData.length) {
      this.testimonialsSubscription = this.genericDataService.testimonials$.subscribe(data => {
        if (data) {
          this.testimonialsData = data;
          this.updateTestimonials();
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testimonialsData']) {
      this.updateTestimonials();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.testimonialsSubscription) {
      this.testimonialsSubscription.unsubscribe();
    }
  }

  private updateTestimonials(): void {
    this.testimonials = this.testimonialsData.length > 0
      ? this.testimonialsData.map(testimonial => ({
          id: `testimonial-${testimonial.id}`,
          en_name: testimonial.en_name,
          ar_name: testimonial.ar_name,
          en_position: testimonial.en_position,
          ar_position: testimonial.ar_position,
          en_text: testimonial.en_text,
          ar_text: testimonial.ar_text,
          imageSrc: API_CONFIG.BASE_URL_IMAGE + testimonial.image,
          imageAlt: `Portrait of ${this.currentLanguage === 'en' ? testimonial.en_name : testimonial.ar_name}, ${this.currentLanguage === 'en' ? testimonial.en_position : testimonial.ar_position}, sharing their experience.`
        }))
      : [
          {
            id: 'testimonial-1',
            en_name: 'John Doe',
            ar_name: 'جون دو',
            en_position: 'Marketing Manager',
            ar_position: 'مدير التسويق',
            en_text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec metus nec ante hendrerit placerat.',
            ar_text: 'لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسينغ إليت. نولام نيك ميتوس نيك أنتي هيندريريت بلاسيرات.',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of John Doe, Marketing Manager, sharing his positive experience.'
          },
          {
            id: 'testimonial-2',
            en_name: 'Jane Smith',
            ar_name: 'جين سميث',
            en_position: 'CEO',
            ar_position: 'الرئيس التنفيذي',
            en_text: 'This product has revolutionized our workflow and greatly improved client satisfaction. Highly recommended!',
            ar_text: 'لقد أحدث هذا المنتج ثورة في سير عملنا وتحسين رضا العملاء بشكل كبير. موصى به بشدة!',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of Jane Smith, CEO, praising the product\'s impact.'
          },
          {
            id: 'testimonial-3',
            en_name: 'Jane Smith',
            ar_name: 'جين سميث',
            en_position: 'CEO',
            ar_position: 'الرئيس التنفيذي',
            en_text: 'This product has revolutionized our workflow and greatly improved client satisfaction. Highly recommended!',
            ar_text: 'لقد أحدث هذا المنتج ثورة في سير عملنا وتحسين رضا العملاء بشكل كبير. موصى به بشدة!',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of Jane Smith, CEO, praising the product\'s impact.'
          },
          {
            id: 'testimonial-4',
            en_name: 'Jane Smith',
            ar_name: 'جين سميث',
            en_position: 'CEO',
            ar_position: 'الرئيس التنفيذي',
            en_text: 'This product has revolutionized our workflow and greatly improved client satisfaction. Highly recommended!',
            ar_text: 'لقد أحدث هذا المنتج ثورة في سير عملنا وتحسين رضا العملاء بشكل كبير. موصى به بشدة!',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of Jane Smith, CEO, praising the product\'s impact.'
          },
          {
            id: 'testimonial-5',
            en_name: 'Peter Jones',
            ar_name: 'بيتر جونز',
            en_position: 'Product Designer',
            ar_position: 'مصمم المنتجات',
            en_text: 'An intuitive interface coupled with powerful features makes this an indispensable tool for our team.',
            ar_text: 'واجهة مستخدم بديهية مقترنة بميزات قوية تجعل هذه أداة لا غنى عنها لفريقنا.',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of Peter Jones, Product Designer, highlighting the product\'s features.'
          },
          {
            id: 'testimonial-6',
            en_name: 'Peter Jones',
            ar_name: 'بيتر جونز',
            en_position: 'Product Designer',
            ar_position: 'مصمم المنتجات',
            en_text: 'An intuitive interface coupled with powerful features makes this an indispensable tool for our team.',
            ar_text: 'واجهة مستخدم بديهية مقترنة بميزات قوية تجعل هذه أداة لا غنى عنها لفريقنا.',
            imageSrc: 'assets/testimonials/testimonial.png',
            imageAlt: 'Portrait of Peter Jones, Product Designer, highlighting the product\'s features.'
          }
        ];
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
    return this.currentLanguage === 'en' ? testimonial.en_position : testimonial.ar_position;
  }

  getText(testimonial: LocalTestimonial): string {
    return this.currentLanguage === 'en' ? testimonial.en_text : testimonial.ar_text;
  }
}