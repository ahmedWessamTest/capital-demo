import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EnglishBlogsService, EnglishBlogsResponse } from '@core/services/blogs/english-blogs.service';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { TruncatePipe } from '@core/pipes/truncate.pipe';
import { animate, style, transition, trigger } from '@angular/animations';
import { SlicePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-english-blogs',
  templateUrl: './english-blogs.component.html',
  styleUrls: ['./english-blogs.component.css'],
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
export class EnglishBlogsComponent implements OnInit, OnDestroy {
  blogsResponse: EnglishBlogsResponse | null = null;
  currentPage: number = 1;
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  isLoading = signal(true);
  currentLanguage: string = 'en';
  loadedImages: Set<string> = new Set();
  
  private destroy$ = new Subject<void>();

  constructor(
    private blogsService: EnglishBlogsService,
    private languageService: LanguageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    
    if (this.currentLanguage !== 'en') {
      this.router.navigate([`${this.currentLanguage}/arabic-blogs`]);
      return;
    }

    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang) => {
        if (lang !== 'en' && lang !== this.currentLanguage) {
          this.router.navigate([`${lang}/arabic-blogs`]);
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
    this.blogsService.getEnglishBlogs(page).subscribe({
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
}