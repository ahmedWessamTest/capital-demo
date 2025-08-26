import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ArabicBlogsService, ArabicBlogsResponse } from '@core/services/blogs/arabic-blogs.service';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { TruncatePipe } from '@core/pipes/truncate.pipe';
import { animate, style, transition, trigger } from '@angular/animations';
import { SlicePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-arabic-blogs',
  templateUrl: './arabic-blogs.component.html',
  styleUrls: ['./arabic-blogs.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe, SlicePipe],
  animations: [
    trigger('skeletonAnimation', [
      transition(':enter', [
        style({ opacity: 0.7 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class ArabicBlogsComponent implements OnInit, OnDestroy {
  blogsResponse: ArabicBlogsResponse | null = null;
  currentPage: number = 1;
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  isLoading = signal(true);
  currentLanguage: string = 'ar';
  loadedImages: Set<string> = new Set();
  
  private destroy$ = new Subject<void>();

  constructor(
    private blogsService: ArabicBlogsService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    
    if (this.currentLanguage !== 'ar') {
      this.router.navigate([`${this.currentLanguage}/english-blogs`]);
      return;
    }

    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        if (lang !== 'ar' && lang !== this.currentLanguage) {
          this.router.navigate([`${lang}/english-blogs`]);
        }
        this.currentLanguage = lang;
      });

    this.loadBlogs(this.currentPage);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogs(page: number): void {
    this.isLoading.set(true);
    this.loadedImages.clear();
    this.blogsService.getArabicBlogs(page).subscribe({
      next: (response) => {
        this.blogsResponse = response;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching blogs:', error);
        this.isLoading.set(false);
      },
    });
  }

  changePage(url: string | null): void {
    if (url) {
      const page = new URL(url).searchParams.get('page');
      if (page) {
        this.currentPage = +page;
        this.loadBlogs(this.currentPage);
      }
    }
  }

  isImageLoaded(imageUrl: string): boolean {
    return this.loadedImages.has(imageUrl);
  }

  onImageLoad(imageUrl: string): void {
    this.loadedImages.add(imageUrl);
  }

  parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  }
}