// import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
// import { Subscription, BehaviorSubject, Observable } from 'rxjs';
// import { LanguageService } from '../../../core/services/language.service';
// import { HeadingComponent } from '@core/shared/heading/heading.component';
// import { ArabicBlogsService, ArabicBlog, ArabicBlogsResponse } from '@core/services/blogs/arabic-blogs.service';
// import { EnglishBlogsService, EnglishBlog, EnglishBlogsResponse } from '@core/services/blogs/english-blogs.service';
// import { API_CONFIG } from '@core/conf/api.config';
// import { TranslateModule } from '@ngx-translate/core';
// import { trigger, transition, style, animate } from '@angular/animations';
// import { Router, RouterLink } from '@angular/router';

// interface BlogItem {
//   id: string;
//   title: string;
//   date: Date | null;
//   imageSrc: string;
//   imageAlt: string;
//   en_slug?: string;
//   ar_slug?: string;
// }

// @Component({
//   selector: 'app-blog-slider',
//   standalone: true,
//   animations:[
//     trigger('skeletonAnimation', [
//       transition(':enter', [
//         style({ opacity: 0 }),
//         animate('300ms ease-in', style({ opacity: 1 })),
//       ]),
//       transition(':leave', [
//         animate('300ms ease-out', style({ opacity: 0 })),
//       ]),
//     ]),
//   ],
//   imports: [CommonModule, CarouselModule, HeadingComponent, TranslateModule,RouterLink],
//   templateUrl: './blogs-page.component.html',
//   styleUrls: ['./blogs-page.component.css']
// })
// export class BlogsPageComponent implements OnInit, OnDestroy {
//   private blogItemsSubject = new BehaviorSubject<BlogItem[]>([]);
//   blogItems$ = this.blogItemsSubject.asObservable();

//   blogItems: BlogItem[] = [];
//   currentLanguage: string = 'en';
//   isLoading: boolean = true;
//   isLanguageChanging: boolean = false;

//   customOptions: OwlOptions = {
//     loop: true,
//     mouseDrag: true,
//     touchDrag: true,
//     pullDrag: true,
//     dots: false,
//     navSpeed: 700,
//     smartSpeed:700,
//     navText: ['<', '>'],
//     nav: true,
//     center:true,
//     autoplay: false,
//     margin:16,
//     responsive: {
//       0: {
//         items: 1,
//         nav: true
//       },
//       400: {
//         items: 1,
//         nav: true
//       },
//       600: {
//         items: 2,
//         nav: true
//       },
//       1000: {
//         items: 3,
//         nav: true
//       }
//     }
//   }

//   private languageSubscription!: Subscription;
//   private blogSubscription!: Subscription;

//   constructor(
//     private languageService: LanguageService,
//     private arabicBlogsService: ArabicBlogsService,
//     private englishBlogsService: EnglishBlogsService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
//       this.isLanguageChanging = true;
//       this.currentLanguage = lang;
//       this.updateCarouselDirection(lang);
//       this.fetchBlogs();
//     });

//     this.blogItems$.subscribe(items => {
//       this.blogItems = items;
//       this.isLoading = false;
//       this.isLanguageChanging = false;
//     });

//     this.fetchBlogs();
//   }

//   ngOnDestroy(): void {
//     if (this.languageSubscription) {
//       this.languageSubscription.unsubscribe();
//     }
//     if (this.blogSubscription) {
//       this.blogSubscription.unsubscribe();
//     }
//   }

//   private fetchBlogs(): void {
//     this.isLoading = true;
//     const observable: Observable<ArabicBlogsResponse | EnglishBlogsResponse> = this.currentLanguage === 'ar'
//       ? this.arabicBlogsService.getArabicBlogs()
//       : this.englishBlogsService.getEnglishBlogs();

//     this.blogSubscription?.unsubscribe(); // Unsubscribe from previous subscription
//     this.blogSubscription = observable.subscribe({
//       next: (response) => {
//         const blogs = response.rows.data.slice(0, 6); // Take only the latest 6 blogs
//         const blogItems: BlogItem[] = blogs.map(blog => this.transformBlog(blog as ArabicBlog | EnglishBlog));
//         this.blogItemsSubject.next(blogItems);
//       },
//       error: () => {
//         this.isLoading = false;
//         this.isLanguageChanging = false;
//       }
//     });
//   }

//   private transformBlog(blog: ArabicBlog | EnglishBlog): BlogItem {
//     const isArabic = this.currentLanguage === 'ar';
//     const dateStr = (blog as ArabicBlog).blog_date || (blog as EnglishBlog).blog_date;

//     let date: Date | null = null;
//     if (dateStr) {
//       const [day, month, year] = dateStr.split('-').map(Number);
//       date = new Date(year, month - 1, day); // month is 0-based in JS Date
//       if (isNaN(date.getTime())) {
//         date = null; // Handle invalid date
//       }
//     }

//     return {
//       id: `blog-${blog.id}`,
//       title: isArabic ? (blog as ArabicBlog).ar_blog_title : (blog as EnglishBlog).en_blog_title,
//       date: date || null,
//       imageSrc: API_CONFIG.BASE_URL_IMAGE + blog.main_image,
//       imageAlt: `Blog post titled ${isArabic ? (blog as ArabicBlog).ar_blog_title : (blog as EnglishBlog).en_blog_title}`,
//       en_slug: (blog as EnglishBlog).en_slug,
//       ar_slug: (blog as ArabicBlog).ar_slug
//     };
//   }
//   navigateToBlog(item: BlogItem): void {
//     console.log("clicked")
//     console.log([this.currentLanguage, 'blog', (this.currentLanguage === 'en' ? item.en_slug : item.ar_slug)])
//     console.log(item)
//     this.router.navigate([this.currentLanguage, 'blog', (this.currentLanguage === 'en' ? item.en_slug : item.ar_slug)]);
//   }
//   // private updateCarouselDirection(lang: string): void {
//   //   const isRtl = lang === 'ar';
//   //   if (this.customOptions.rtl !== isRtl) {
//   //     this.customOptions = { ...this.customOptions, rtl: isRtl };
//   //   }
//   // }
//   // In BlogsPageComponent
// @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

// private updateCarouselDirection(lang: string): void {
//   const isRtl = lang === 'ar';
//   if (this.customOptions.rtl !== isRtl) {
//     this.customOptions = { ...this.customOptions, rtl: isRtl };
//     if (this.owlCarousel && this.blogItems.length > 0) {
//       this.owlCarousel.to(this.blogItems[0].id); // Refresh carousel
//     }
//   }
// }
// }
import { Component, OnInit, OnDestroy, ViewChild, LOCALE_ID, REQUEST } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CarouselComponent, CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { HeadingComponent } from '@core/shared/heading/heading.component';
import { ArabicBlogsService, ArabicBlog, ArabicBlogsResponse } from '@core/services/blogs/arabic-blogs.service';
import { EnglishBlogsService, EnglishBlog, EnglishBlogsResponse } from '@core/services/blogs/english-blogs.service';
import { API_CONFIG } from '@core/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, RouterLink } from '@angular/router';
import { Request } from 'express';

interface BlogItem {
  id: string;
  title: string;
  date: Date | null;
  imageSrc: string;
  imageAlt: string;
  en_slug?: string;
  ar_slug?: string;
}

@Component({
  selector: 'app-blog-slider',
  standalone: true,
  animations: [
    trigger('skeletonAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  imports: [CommonModule, CarouselModule, HeadingComponent, TranslateModule,RouterLink,DatePipe],
  templateUrl: './blogs-page.component.html',
  styleUrls: ['./blogs-page.component.css'],
  
})
export class BlogsPageComponent implements OnInit, OnDestroy {
  private blogItemsSubject = new BehaviorSubject<BlogItem[]>([]);
  blogItems$ = this.blogItemsSubject.asObservable();

  blogItems: BlogItem[] = [];
  currentLanguage: string = 'en';
  isLoading: boolean = true;
  isLanguageChanging: boolean = false;
  centeredSlideId: string | null = null; // New property to track centered slide

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    smartSpeed: 700,
    navText: ['<', '>'],
    nav: true,
    center: true,
    autoplay: false,
    margin: 16,
    responsive: {
      0: { items: 1, nav: true },
      400: { items: 1, nav: true },
      600: { items: 2, nav: true },
      1000: { items: 3, nav: true }
    }
  }

  private languageSubscription!: Subscription;
  private blogSubscription!: Subscription;

  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;

  constructor(
    private languageService: LanguageService,
    private arabicBlogsService: ArabicBlogsService,
    private englishBlogsService: EnglishBlogsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.isLanguageChanging = true;
      this.currentLanguage = lang;
      this.updateCarouselDirection(lang);
      this.fetchBlogs();
    });

    this.blogItems$.subscribe(items => {
      
      this.blogItems = items;
      this.isLoading = false;
      this.isLanguageChanging = false;
    });

    this.fetchBlogs();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.blogSubscription) {
      this.blogSubscription.unsubscribe();
    }
  }

  private fetchBlogs(): void {
    this.isLoading = true;
    const observable: Observable<ArabicBlogsResponse | EnglishBlogsResponse> = this.currentLanguage === 'ar'
      ? this.arabicBlogsService.getArabicBlogs()
      : this.englishBlogsService.getEnglishBlogs();

    this.blogSubscription?.unsubscribe();
    this.blogSubscription = observable.subscribe({
      next: (response) => {
        const blogs = response.rows.data.slice(0, 6);
        const blogItems: BlogItem[] = blogs.map(blog => this.transformBlog(blog as ArabicBlog | EnglishBlog));
        this.blogItemsSubject.next(blogItems);
      },
      error: () => {
        this.isLoading = false;
        this.isLanguageChanging = false;
      }
    });
  }

  private transformBlog(blog: ArabicBlog | EnglishBlog): BlogItem {
    const isArabic = this.currentLanguage === 'ar';
    const dateStr = (blog as ArabicBlog).blog_date || (blog as EnglishBlog).blog_date;

    let date: Date | null = null;
    if (dateStr) {
      const [day, month, year] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        date = null;
      }
    }

    return {
      id: `blog-${blog.id}`,
      title: isArabic ? (blog as ArabicBlog).ar_blog_title : (blog as EnglishBlog).en_blog_title,
      date: date || null,
      imageSrc: API_CONFIG.BASE_URL_IMAGE + blog.main_image,
      imageAlt: `Blog post titled ${isArabic ? (blog as ArabicBlog).ar_blog_title : (blog as EnglishBlog).en_blog_title}`,
      en_slug: (blog as EnglishBlog).en_slug,
      ar_slug: (blog as ArabicBlog).ar_slug
    };
  }

  navigateToBlog(item: BlogItem): void {
    this.router.navigate([this.currentLanguage, 'blog', (this.currentLanguage === 'en' ? item.en_slug : item.ar_slug)]);
  }

  onTranslated(data: SlidesOutputData): void {
    const centeredSlide = data.slides?.find(slide => slide.center);
    this.centeredSlideId = centeredSlide ? centeredSlide.id : null;
  }

  private updateCarouselDirection(lang: string): void {
    const isRtl = lang === 'ar';
    if (this.customOptions.rtl !== isRtl) {
      this.customOptions = { ...this.customOptions, rtl: isRtl };
      if (this.owlCarousel && this.blogItems.length > 0) {
        this.owlCarousel.to(this.blogItems[0].id);
      }
    }
  }

  getShortMonth(date: any):any {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const d = new Date(date);
  return months[d.getMonth()];
}
}