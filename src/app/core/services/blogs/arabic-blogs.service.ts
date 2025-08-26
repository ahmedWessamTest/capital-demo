import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap, shareReplay } from 'rxjs';
import { API_CONFIG } from '@core/conf/api.config';

export interface ArabicBlog {
  id: number;
  ar_blog_title: string;
  ar_slug: string;
  ar_blog_text: string;
  main_image: string;
  blog_date: string | null;
  ar_meta_title: string;
  ar_meta_text: string;
  ar_first_script_text: string;
  ar_second_script_text: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface ArabicBlogsResponse {
  rows: {
    current_page: number;
    data: ArabicBlog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface SingleArabicBlogResponse {
  blog: ArabicBlog;
  blogs: ArabicBlog[];
}

@Injectable({
  providedIn: 'root',
})
export class ArabicBlogsService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;
  private readonly CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
  
  // Fixed: Use Map to store blogs by page instead of single signal
  private blogsCache = signal<Map<number, ArabicBlogsResponse>>(new Map());
  private singleBlogCache = signal<Map<string, SingleArabicBlogResponse>>(new Map());
  private cacheTimestamps = signal<Map<string, number>>(new Map());

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getArabicBlogs(page: number = 1): Observable<ArabicBlogsResponse> {
    if (!this.isBrowser()) {
      return new Observable<ArabicBlogsResponse>(observer => observer.complete());
    }

    const cacheKey = `blogs-page-${page}`;
    const cachedData = this.blogsCache().get(page);
    
    // Fixed: Check if we have cached data for this specific page
    if (this.isCacheValid(cacheKey) && cachedData) {
      return of(cachedData);
    }

    const observable = this._http.get<ArabicBlogsResponse>(
      `${this.baseUrl}app-blogs/getArabicBlogs?page=${page}`
    ).pipe(
      tap(data => {
        // Fixed: Store data with page number as key
        this.blogsCache.update(cache => new Map(cache).set(page, data));
        this.updateCacheTimestamp(cacheKey);
      }),
      shareReplay(1)
    );

    return observable;
  }

  getSingleArabicBlog(slug: string): Observable<SingleArabicBlogResponse> {
    if (!this.isBrowser()) {
      return new Observable<SingleArabicBlogResponse>(observer => observer.complete());
    }

    const cacheKey = `blog-${slug}`;
    const cachedBlog = this.singleBlogCache().get(cacheKey);
    
    if (this.isCacheValid(cacheKey) && cachedBlog) {
      return of(cachedBlog);
    }

    const observable = this._http.get<SingleArabicBlogResponse>(
      `${this.baseUrl}app-blogs/getSingleArabicBlogs/${slug}`
    ).pipe(
      tap(data => {
        this.singleBlogCache.update(cache => new Map(cache).set(cacheKey, data));
        this.updateCacheTimestamp(cacheKey);
      }),
      shareReplay(1)
    );

    return observable;
  }

  invalidateCache(cacheKey: string): void {
    if (cacheKey.startsWith('blogs-page-')) {
      // Fixed: Extract page number and remove only that page from cache
      const pageMatch = cacheKey.match(/blogs-page-(\d+)/);
      if (pageMatch) {
        const page = parseInt(pageMatch[1], 10);
        this.blogsCache.update(cache => {
          const newCache = new Map(cache);
          newCache.delete(page);
          return newCache;
        });
      }
    } else if (cacheKey.startsWith('blog-')) {
      this.singleBlogCache.update(cache => {
        const newCache = new Map(cache);
        newCache.delete(cacheKey);
        return newCache;
      });
    }
    
    this.cacheTimestamps.update(timestamps => {
      const newTimestamps = new Map(timestamps);
      newTimestamps.delete(cacheKey);
      return newTimestamps;
    });
  }

  // Optional: Method to clear all blogs cache
  clearBlogsCache(): void {
    this.blogsCache.set(new Map());
    // Clear all blog-related timestamps
    this.cacheTimestamps.update(timestamps => {
      const newTimestamps = new Map();
      for (const [key, value] of timestamps.entries()) {
        if (!key.startsWith('blogs-page-')) {
          newTimestamps.set(key, value);
        }
      }
      return newTimestamps;
    });
  }

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps().get(key) || 0;
    return timestamp !== 0 && Date.now() - timestamp < this.CACHE_EXPIRATION;
  }

  private updateCacheTimestamp(key: string, time = Date.now()): void {
    this.cacheTimestamps.update(timestamps => new Map(timestamps).set(key, time));
  }
}