import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Injectable({
  providedIn: 'root',
})
export class BlogLanguageGuard implements CanActivate {
  constructor(
    private languageService: LanguageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const lang = route.paramMap.get('lang');
    const isEnglishBlog = state.url.includes('/en/blog/') || state.url.includes('/english-blogs');
    const isArabicBlog = state.url.includes('/ar/blog/') || state.url.includes('/arabic-blogs');

    if (lang === 'en' && isArabicBlog) {
      this.router.navigate(['en/english-blogs']);
      return false;
    }
    if (lang === 'ar' && isEnglishBlog) {
      this.router.navigate(['ar/arabic-blogs']);
      return false;
    }
    return true;
  }
}