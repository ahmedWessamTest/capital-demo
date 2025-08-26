import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AlertComponent } from "./core/shared/alert/alert.component";
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/policies/notification.service';
import { NavbarComponent } from "./website-pages/navbar/navbar.component";
import { FooterComponent } from "@core/components/footer/footer.component";
import { Title, Meta } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';
import { WhatsappFloatComponent } from "./website-pages/floating-whatsapp/floating-whatsapp.component";

@Component({
  selector: 'app-root',
  imports: [
    CarouselModule,
    CommonModule,
    RouterModule,
    AlertComponent,
    NavbarComponent,
    FooterComponent,
    WhatsappFloatComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
})
export class AppComponent implements OnInit {
  title = 'angular-portfolio';

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 }
    },
    nav: true
  };

  activeSlide = 0;
  slides = [1, 2, 3];
  insuranceType: 'car' | 'medical' | 'property' = 'car';

  constructor(
    private _router: Router,
    private translationService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  notificationService = inject(NotificationService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize language
      const savedLang = localStorage.getItem('language') || 'en';
      this.translationService.use(savedLang);
  
      // Scroll to top on route change
      this._router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.scrollTo(0, 0);
      });
  
      this._router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap(route => route.data)
      ).subscribe(data => {
        const titleKey = data['title'] || 'ROUTES.HOME.TITLE';
        const descKey = data['description'] || 'ROUTES.HOME.DESCRIPTION';
  
        this.translationService.get(titleKey).subscribe((translatedTitle: string) => {
          this.titleService.setTitle(translatedTitle);
        });
  
        this.translationService.get(descKey).subscribe((translatedDesc: string) => {
          this.metaService.updateTag({ name: 'description', content: translatedDesc });
        });
      });
    } else {
      // Server-side fallback for language
      this.translationService.use('en'); 
    }
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
  }
}