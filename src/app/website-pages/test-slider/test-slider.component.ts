// test-slider.component.ts
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-test-slider',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './test-slider.component.html',
  styleUrl: './test-slider.component.css'
})
export class TestSliderComponent implements OnInit, OnDestroy {
  @ViewChild('categoriesSlider') categoriesSlider!: CarouselComponent;

  // Use a variable for RTL state
  isRtl = false;

  // Updated items array to match the structure of the hero section slider's needs, including alt for SEO
  items = [
    {
      src: "assets/categories/medical.png",
      id: "slide-1",
      en_text: "Medical",
      ar_text: "طبي",
      alt: "Icon representing medical services or insurance." // Added alt for SEO
    },
    {
      src: "assets/categories/propert.png",
      id: "slide-2",
      en_text: "Property",
      ar_text: "عقاري",
      alt: "Icon representing property insurance or real estate." // Added alt for SEO
    },
    {
      src: "assets/categories/medical.png",
      id: "slide-3",
      en_text: "Life Insurance",
      ar_text: "تأمين على الحياة",
      alt: "Icon representing life insurance." // Added alt for SEO
    },
    {
      src: "assets/categories/medical.png",
      id: "slide-4",
      en_text: "Auto Insurance",
      ar_text: "تأمين سيارات",
      alt: "Icon representing auto insurance." // Added alt for SEO
    },
    {
      src: "assets/categories/medical.png",
      id: "slide-5",
      en_text: "Travel Insurance",
      ar_text: "تأمين سفر",
      alt: "Icon representing travel insurance." // Added alt for SEO
    },
  ];

  carouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: -40,
    navSpeed: 1000,
    smartSpeed: 700,
    autoWidth: false,
    navText: ['<', '>'],
    center: true,
    nav: false,
    rtl: false, // Default will be updated by LanguageService
    responsive: {
      0: {
        items: 3,
        slideBy: 1
      },
      600: {
        items: 3,
        slideBy: 1
      },
      1000: {
        items: 3,
        slideBy: 1
      }
    }
  }

  activeSlideIndex = 0; // Keeping this for potential future navigation control

  private languageSubscription!: Subscription;

  constructor(public languageService: LanguageService) { }

  ngOnInit(): void {
    // Initial setup for language and RTL
    const initialLang = this.languageService.getCurrentLanguage();
    this.isRtl = initialLang === 'ar';
    this.carouselOptions = { ...this.carouselOptions, rtl: this.isRtl };

    // Subscribe to language changes to update RTL state
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.isRtl = lang === 'ar';
      // Force an update by creating a new options object to trigger change detection in ngx-owl-carousel-o
      this.carouselOptions = { ...this.carouselOptions, rtl: this.isRtl };

      // A small delay and re-navigation can help ensure the carousel re-renders correctly with the new RTL setting.
      // This is particularly important for ngx-owl-carousel-o to fully apply RTL changes.
      setTimeout(() => {
        if (this.categoriesSlider) {
          // Attempt to go to the current active slide or the first slide to force re-layout
          const currentSlideId = this.items[this.activeSlideIndex]?.id || this.items[0].id;
          this.categoriesSlider.to(currentSlideId);
        }
      }, 50); // Small delay
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  // Method to handle slide changes and update activeSlideIndex
  // This is compatible with both 'translated' and 'initialized' events from ngx-owl-carousel-o
  getData(data: any) {
    if (data && data.startPosition !== undefined) {
      this.activeSlideIndex = data.startPosition;
    }
  }

  // Method to navigate to a specific slide (used by navigation dots if implemented)
  moveToSlide(carousel: CarouselComponent, slideId: string) {
    carousel.to(slideId);
  }

  // Adjusted 'next' method to directly call ngx-owl-carousel-o's next method
  // This aligns with how the second component handles navigation, while still having the language change logic.
  next() {
    this.categoriesSlider.next();
  }

  // Image optimization: Generates srcset for responsive images
  getSrcset(imagePath: string): string {
    const baseName = imagePath.substring(0, imagePath.lastIndexOf('.'));
    const extension = imagePath.substring(imagePath.lastIndexOf('.'));
    // Providing different sizes for different breakpoints
    return `${baseName}_small${extension} 480w, ${baseName}_medium${extension} 768w, ${baseName}${extension} 1200w`;
  }
}