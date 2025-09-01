
import { Component, HostListener, ViewChild, OnInit, OnDestroy, AfterViewInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions, SlidesOutputData, CarouselComponent } from 'ngx-owl-carousel-o';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LanguageService } from '../../../core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { Slider, UpdatedGenericDataService } from '@core/services/updated-general.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideContent', [
      state('in', style({ opacity: 1, transform: 'translateY(0) translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ]),
    trigger('slideFromRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('700ms 200ms ease-out')
      ])
    ]),
    trigger('slideFromLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('700ms 400ms ease-out')
      ])
    ])
  ]
})
export class HeroSectionComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('owlCar') owlCar!: CarouselComponent;
  @Input() sliders: Slider[] = [];

  slides: { id: string; image: string; alt: string; en_title: string; ar_title: string; en_description: string; ar_description: string; en_buttonText: string; ar_buttonText: string }[] = [];
  currentLanguage: string = 'en';
  private readonly IMAGE_URL: string = API_CONFIG.BASE_URL_IMAGE;
  isLoading: boolean = true;
  private rafId: number | null = null;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    nav: false,
    items: 1,
    autoplay: true,
    autoplayTimeout: 20000, // 10 seconds per slide
    autoplaySpeed: 0, // Transition speed for autoplay
    animateOut: false,
    animateIn: false,
    smartSpeed: 0, // General transition speed
    responsive: {
      0: { items: 1 },
      768: { items: 1 },
    },
    dotsSpeed: 1000,
    navSpeed: 0,
  };

  isDragging: boolean = false;
  activeSlideIndex: number = 0;
  activeSlides: SlidesOutputData | undefined;
  isAnimating: boolean = false;
  currentSlideKey: number = 0;
  sliderHeight: string = '800px';
  private languageSubscription: Subscription | undefined;
  private slidersSubscription: Subscription | undefined;
  private resizeSubject: Subject<void> = new Subject<void>();
  private resizeSubscription: Subscription | undefined;

  constructor(
    private languageService: LanguageService,
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.resizeSubscription = this.resizeSubject.pipe(
      debounceTime(100)
    ).subscribe(() => {
      this.calculateSliderHeight();
      this.cdr.markForCheck();
    });
  }
aboutDownload: any;
  ngOnInit(): void {
    this.calculateSliderHeight();
    
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
      this.updateCarouselDirection(lang);
      this.cdr.markForCheck();
    });

    if(isPlatformBrowser(this.platformId)){
      this.aboutDownload = JSON.parse(localStorage.getItem('aboutDownload') || '[]').android_download_link;
      console.log(this.aboutDownload)
    }
    if (this.sliders && this.sliders.length > 0) {
      this.updateSlides();
      this.setLoadingComplete();
    } else {
      this.slidersSubscription = this.genericDataService.sliders$.subscribe(sliders => {
        if (sliders && sliders.length > 0) {
          this.sliders = sliders;
          this.updateSlides();
          this.setLoadingComplete();
          this.cdr.markForCheck();
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sliders'] && changes['sliders'].currentValue && changes['sliders'].currentValue.length > 0) {
      this.updateSlides();
      this.setLoadingComplete();
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    this.safeRequestAnimationFrame(() => {
      this.calculateSliderHeight();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.slidersSubscription) {
      this.slidersSubscription.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private safeRequestAnimationFrame(callback: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      this.rafId = requestAnimationFrame(() => {
        callback();
        this.rafId = null;
      });
    } else {
      callback();
    }
  }

  private updateSlides(): void {
    if (this.sliders && this.sliders.length > 0) {
      this.slides = this.sliders.map((slider, index) => ({
        id: `slide-${slider.id}`,
        image: this.IMAGE_URL + slider.image,
        alt: `Illustration for ${slider.en_title}`,
        en_title: slider.en_title,
        ar_title: slider.ar_title,
        en_description: slider.en_description,
        ar_description: slider.ar_description,
        en_buttonText: 'Download The App',
        ar_buttonText: 'تحميل التطبيق'
      }));
    } else {
      this.slides = [];
    }
  }


  private preloadCriticalImages(): void {
    if (this.slides.length > 0) {
      const criticalImages = this.slides.slice(0, 2);
      criticalImages.forEach((slide, index) => {
        const img = new Image();
        img.src = slide.image;
        if (index === 0) {
          img.fetchPriority = 'high';
          img.onload = () => {
            if (this.isLoading) {
              this.onImageLoad(0);
            }
          };
          if (img.complete) {
            this.onImageLoad(0);
          }
        }
      });
    }
  }

  private updateCarouselDirection(lang: string): void {
    const isRtl = lang === 'ar';
    if (this.customOptions.rtl !== isRtl) {
      this.customOptions = { ...this.customOptions, rtl: isRtl };
      if (this.owlCar && !this.isLoading) {
        const currentSlideId = this.slides[this.activeSlideIndex]?.id || this.slides[0]?.id;
        if (currentSlideId) {
          this.owlCar.to(currentSlideId);
        }
      }
    }
  }

  getData(data: SlidesOutputData): void {
    this.activeSlides = data;
    if (data && data.startPosition !== undefined) {
      this.activeSlideIndex = data.startPosition;
      this.triggerContentAnimation();
      this.cdr.markForCheck();
    }
  }

  handleDragging(event: { dragging: boolean; data: SlidesOutputData }): void {
    this.isDragging = event.dragging;
    this.cdr.markForCheck();
  }

  moveToSlide(carousel: CarouselComponent, id: string): void {
    if (this.isLoading) return;
    
    this.isAnimating = true;
    carousel.to(id);
    this.triggerContentAnimation();
    this.announceSlideChange(id);
    this.cdr.markForCheck();
  }

  private triggerContentAnimation(): void {
    this.currentSlideKey = Date.now();
    this.safeRequestAnimationFrame(() => {
      this.isAnimating = false;
      this.cdr.markForCheck();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeSubject.next();
  }

  calculateSliderHeight(): void {
    if (isPlatformBrowser(this.platformId)) {
      const navbar = document.querySelector('header');
      if (navbar) {
        const navbarHeight = navbar.offsetHeight;
        const viewportHeight = window.innerHeight;
        const calculatedHeight = viewportHeight - navbarHeight;
        this.sliderHeight = `${calculatedHeight}px`;
      } else {
        const viewportHeight = window.innerHeight;
        const estimatedNavHeight = window.innerWidth >= 768 ? 226 : 60;
        this.sliderHeight = `${viewportHeight - estimatedNavHeight}px`;
      }
    } else {
      // Fallback for server-side rendering
      this.sliderHeight = '800px';
    }
  }

  private announceSlideChange(slideId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const liveRegion = document.getElementById('carousel-live-region');
      if (liveRegion) {
        const slideIndex = this.slides.findIndex(s => s.id === slideId);
        if (slideIndex !== -1) {
          liveRegion.textContent = `Now on slide ${slideIndex + 1} of ${this.slides.length}: ${this.currentLanguage === 'en' ? this.slides[slideIndex].en_title : this.slides[slideIndex].ar_title}.`;
        }
      }
    }
  }

  getTitle(slide: { en_title: string; ar_title: string }): string {
    return this.currentLanguage === 'en' ? slide.en_title : slide.ar_title;
  }

  getDescription(slide: { en_description: string; ar_description: string }): string {
    return this.currentLanguage === 'en' ? slide.en_description : slide.ar_description;
  }

  getButtonText(slide: { en_buttonText: string; ar_buttonText: string }): string {
    return this.currentLanguage === 'en' ? slide.en_buttonText : slide.ar_buttonText;
  }

  trackBySlideId(index: number, slide: { id: string }): string {
    return slide.id;
  }

  private loadedImages: Set<number> = new Set<number>();

  onImageLoad(index: number): void {
    this.loadedImages.add(index);
    if (index === 0 && this.isLoading) {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private setLoadingComplete(): void {
    if (this.slides && this.slides.length > 0) {
      this.preloadCriticalImages();
      setTimeout(() => {
        if (this.isLoading) {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      }, 100);
    }
  }
}