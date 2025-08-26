import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChildren, QueryList, Inject, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HeadingComponent } from '@core/shared/heading/heading.component';
import { Counter, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { LanguageService } from '@core/services/language.service'; // Import your LanguageService
import { PLATFORM_ID } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

interface BillItem {
  id: string;
  targetNumber: number;
  text: string;
  imageUrl: string;
  currentNumber: number;
  hasAnimated?: boolean;
}

export interface Category {
  id: number;
  en_title: string;
  ar_title: string;
  en_slug: string;
  ar_slug: string;
  en_small_description: string;
  ar_small_description: string;
  en_main_description: string;
  ar_main_description: string;
  network_link: string;
  counter_number: number | string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-bill',
  template: `
    <section class="overflow-hidden  w-full px-4 relative bg-white md:px-12 my-12" aria-labelledby="bill-heading">
      <div class="relative z-10">
        <app-heading 
          id="bill-heading"
          [headingText]="'number_solid' | translate" 
          [showStartSvg]="false" 
          [showEndSvg]="true">
        </app-heading>
        
        <div class="mx-auto flex justify-center max-w-[1300px] p-4 rounded-[100px] bg-[#EDF9FF]">
          <div class="p-6 w-full" [ngStyle]="{ 'height': isLargeScreen ? '200px' : 'auto' }">
            <ul class="counter flex flex-col md:flex-row md:justify-between h-full" role="list">
              <li
                *ngFor="let item of billItems; let i = index"
                class="flex flex-col items-center justify-center p-4 rounded-xl mb-4 md:mb-0 md:mr-4 last:md:mr-0"
                [ngStyle]="{ 'max-height': '180px', 'flex': isLargeScreen ? '1 1 0%' : 'none' }"
                #itemRef
                role="listitem"
              >
                <span class="number font-bold" aria-hidden="true">+{{ item.currentNumber | number:'1.0-0' }}</span>
                <span class="text">{{ item.text }}</span>
                <img 
                  [src]="item.imageUrl" 
                  [alt]="item.text + ' icon'" 
                  class="w-[50px] my-1 h-[50px] object-cover" 
                  loading="lazy"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <img
        src="assets/policies/bg.png"
        [alt]="'pages.medical_policy.background_image_alt' | translate"
        class="hidden md:block absolute object-contain -bottom-40 h-[500px] w-[300px] -end-30 z-0"
        loading="lazy"
        aria-hidden="true"
      />
    </section>
  `,
  styles: [`
    .number {
      color: #37A6DE;
      font-family: Alexandria;
      font-size: clamp(40px, 5vw, 60px);
      font-style: normal;
      line-height: 65px;
      text-transform: capitalize;
    }
    .text {
      color: #5DB5DF;
      text-align: center;
      font-family: Alexandria;
      font-size: clamp(16px, 2vw, 23px);
      font-style: normal;
      font-weight: 400;
      line-height: 55px;
      text-transform: capitalize;
    }
  `],
  standalone: true,
  imports: [CommonModule, HeadingComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillComponent implements OnInit, AfterViewInit, OnDestroy {
  billItems: BillItem[] = [];
  isLargeScreen: boolean = false;
  observer!: IntersectionObserver;
  private isBrowser: boolean;
  private subscription: Subscription = new Subscription();
  counters: Counter[] = [];

  @ViewChildren('itemRef', { read: ElementRef }) itemElements!: QueryList<ElementRef>;
  
  GenericDataService = inject(UpdatedGenericDataService);
  translate = inject(TranslateService);
  languageService = inject(LanguageService);
  cdr = inject(ChangeDetectorRef);
  
  currentLang: string = 'en';
  categories: Category[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.checkScreenSize();
      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  ngOnInit(): void {
    // Get initial language from LanguageService
    this.currentLang = this.languageService.getCurrentLanguage();
    
    // Combine both language changes and categories data
    this.subscription.add(
      combineLatest([
        this.languageService.currentLanguage$.pipe(startWith(this.currentLang)),
        this.GenericDataService.getCounters()

      ]).subscribe(([lang, counters]) => {
        this.currentLang = lang;
        this.counters = counters;
        this.updateBillItems();
        // Trigger change detection since we're using OnPush
        this.cdr.markForCheck();
      })
    );

    
  }

  updateBillItems() {
    if (this.counters.length === 0) {
      return; // Don't update if no categories yet
    }

    this.billItems = this.counters.map((counter, index) => ({
      id: `item${index + 1}`,
      targetNumber: Number(counter.counter_value) || 0,
      text: this.currentLang === 'ar' ? counter.ar_name : counter.en_name,
      imageUrl: `assets/policies/${['medical-icon.png',  'car-icon.png','building-icon.png',][index % 3]}`,
      currentNumber: 0,
      hasAnimated: false
    }));

    // Reset animations when language changes
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.isBrowser) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        this.setupIntersectionObserver();
        this.cdr.markForCheck();
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.setupIntersectionObserver();
    }

    this.subscription.add(
      this.itemElements.changes.subscribe(() => {
        if (this.observer) {
          this.observer.disconnect();
        }
        setTimeout(() => {
          this.setupIntersectionObserver();
        }, 100);
      })
    );
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
      if (this.observer) {
        this.observer.disconnect();
      }
    }
    this.subscription.unsubscribe();
  }

  private setupIntersectionObserver(): void {
    if (this.isBrowser && this.itemElements && this.itemElements.length > 0) {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = this.itemElements.toArray().findIndex((el) => el.nativeElement === entry.target);
            if (index !== -1 && entry.isIntersecting && !this.billItems[index].hasAnimated) {
              this.billItems[index].hasAnimated = true;
              this.startCountAnimation(this.billItems[index]);
            }
          });
        },
        { threshold: 0.2 }
      );

      this.itemElements.forEach((el) => this.observer.observe(el.nativeElement));
    }
  }

  private startCountAnimation(item: BillItem): void {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = item.targetNumber / steps;
    let currentStep = 0;

    const update = () => {
      currentStep++;
      const newCurrentNumber = Math.min(
        item.targetNumber,
        Math.ceil(currentStep * stepValue)
      );

      const itemIndex = this.billItems.findIndex((billItem) => billItem.id === item.id);
      if (itemIndex > -1 && this.billItems[itemIndex].currentNumber !== newCurrentNumber) {
        this.billItems = [
          ...this.billItems.slice(0, itemIndex),
          { ...this.billItems[itemIndex], currentNumber: newCurrentNumber },
          ...this.billItems.slice(itemIndex + 1)
        ];
        
        // Trigger change detection for the animation
        this.cdr.markForCheck();
      }

      if (currentStep < steps) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  private checkScreenSize(): void {
    if (this.isBrowser) {
      this.isLargeScreen = window.innerWidth >= 768;
      this.cdr.markForCheck();
    }
  }
}