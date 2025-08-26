
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { EnglishBlogsService, EnglishBlog, SingleEnglishBlogResponse } from '@core/services/blogs/english-blogs.service';
import { ArabicBlogsService, ArabicBlog, SingleArabicBlogResponse } from '@core/services/blogs/arabic-blogs.service';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { animate, style, transition, trigger } from '@angular/animations';
import { SafeHtmlComponent } from '@core/components/safe-html/safe-html.component';
import { shareReplay, tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CustomTranslatePipe } from "../../../core/pipes/translate.pipe";
import { SafeHtmlPipe } from "../../../core/pipes/safe-html.pipe";
interface SidebarPost {
  id: number;
  title: string;
  date: string;
  image: string;
  slug: string;
}

interface BlogResponse {
  blog: EnglishBlog | ArabicBlog;
  blogs: (EnglishBlog | ArabicBlog)[];
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, SafeHtmlComponent, CustomTranslatePipe, SafeHtmlPipe],
  templateUrl: './blogs-details.component.html',
  styleUrls: ['./blogs-details.component.css'],
  animations: [
    trigger('skeletonAnimation', [
      transition(':enter', [
        style({ opacity: 0.7 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class BlogPostComponent implements OnInit {
  blog: EnglishBlog | ArabicBlog | null = null;
  sidebarPosts: SidebarPost[] = [];
  isLoading = signal(true);
  API_CONFIG = API_CONFIG.BASE_URL_IMAGE;
  loadedImages = new Set<number>();

  constructor(
    private blogsService: EnglishBlogsService,
    private arabicBlogsService: ArabicBlogsService,
    private route: ActivatedRoute,
    private router: Router,
    public languageService: LanguageService,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(params => {
        const slug = params.get('slug');
        const lang = params.get('lang');
        if (!slug || !lang || lang !== this.languageService.getCurrentLanguage()) {
          this.redirectToBlogList();
          return;
        }
        this.loadBlog(slug);
      })
    ).subscribe();
  }

  loadBlog(slug: string): void {
    this.isLoading.set(true);
    const blogObservable: Observable<BlogResponse> = this.languageService.getCurrentLanguage() === 'ar'
      ? this.arabicBlogsService.getSingleArabicBlog(slug).pipe(
          map((response: SingleArabicBlogResponse) => ({
            blog: response.blog,
            blogs: response.blogs,
          })),
          shareReplay(1)
        )
      : this.blogsService.getSingleEnglishBlog(slug).pipe(
          map((response: SingleEnglishBlogResponse) => ({
            blog: response.blog,
            blogs: response.blogs,
          })),
          shareReplay(1)
        );

    blogObservable.subscribe({
      next: (response: BlogResponse) => {
        if (!response.blog) {
          this.redirectToBlogList();
          return;
        }
        this.blog = response.blog;

        // Set SEO meta tags
        const metaTitle = this.languageService.getCurrentLanguage() === 'ar'
          ? (this.blog as ArabicBlog).ar_meta_title || (this.blog as ArabicBlog).ar_blog_title
          : (this.blog as EnglishBlog).en_meta_title || (this.blog as EnglishBlog).en_blog_title;
        const metaText = this.languageService.getCurrentLanguage() === 'ar'
          ? (this.blog as ArabicBlog).ar_meta_text || ''
          : (this.blog as EnglishBlog).en_meta_text || '';
        const canonicalUrl = window.location.href;
        const imageUrl = this.getOptimizedImageUrl(response.blog.main_image);

        this.title.setTitle(metaTitle);
        this.meta.updateTag({ name: 'description', content: metaText });
        this.meta.updateTag({ name: 'og:title', content: metaTitle });
        this.meta.updateTag({ name: 'og:description', content: metaText });
        this.meta.updateTag({ name: 'og:image', content: imageUrl });
        this.meta.updateTag({ name: 'og:url', content: canonicalUrl });
        this.meta.updateTag({ name: 'og:type', content: 'article' });
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: metaTitle });
        this.meta.updateTag({ name: 'twitter:description', content: metaText });
        this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
        this.meta.updateTag({ rel: 'canonical', href: canonicalUrl });

        this.sidebarPosts = response.blogs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((blog) => ({
            id: blog.id,
            title: this.languageService.getCurrentLanguage() === 'ar' ? (blog as ArabicBlog).ar_blog_title : (blog as EnglishBlog).en_blog_title,
            date: blog.blog_date ?? new Date().toISOString().split('T')[0],
            image: blog.main_image,
            slug: this.languageService.getCurrentLanguage() === 'ar' ? (blog as ArabicBlog).ar_slug : (blog as EnglishBlog).en_slug,
          }));
        this.isLoading.set(false);
      },
      error: () => this.redirectToBlogList(),
    });
  }

  getOptimizedImageUrl(imagePath: string): string {
    return `${this.API_CONFIG}${imagePath}?w=1200&h=300&fit=crop&q=80`;
  }

  getBlogTitle(): string {
    if (!this.blog) return '';
    return this.languageService.getCurrentLanguage() === 'en'
      ? (this.blog as EnglishBlog).en_blog_title
      : (this.blog as ArabicBlog).ar_blog_title;
  }

  getBlogText(): string {
    if (!this.blog) return '';
    return this.languageService.getCurrentLanguage() === 'en'
      ? (this.blog as EnglishBlog).en_blog_text
      : (this.blog as ArabicBlog).ar_blog_text;
  }

  getFirstScriptText(): string {
    if (!this.blog) return '';
    return this.languageService.getCurrentLanguage() === 'en'
      ? (this.blog as EnglishBlog).en_first_script_text
      : (this.blog as ArabicBlog).ar_first_script_text;
  }

  getSecondScriptText(): string {
    if (!this.blog) return '';
    return this.languageService.getCurrentLanguage() === 'en'
      ? (this.blog as EnglishBlog).en_second_script_text
      : (this.blog as ArabicBlog).ar_second_script_text;
  }

  redirectToBlogList(): void {
    const lang = this.languageService.getCurrentLanguage();
    this.router.navigate([`${lang}/${lang === 'en' ? 'english-blogs' : 'arabic-blogs'}`]);
  }

  trackByPostId(_index: number, post: SidebarPost): number {
    return post.id;
  }

  onPostClick(post: SidebarPost): void {
    this.router.navigate([`/${this.languageService.getCurrentLanguage()}/blog`, post.slug]);
  }

  onImageLoad(postId: number): void {
    this.loadedImages.add(postId);
  }

  isImageLoaded(postId: number): boolean {
    return this.loadedImages.has(postId);
  }
}