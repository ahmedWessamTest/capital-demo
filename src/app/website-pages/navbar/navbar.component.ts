
import { Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { NotificationService } from '@core/services/policies/notification.service';
import { ContactData, UpdatedGenericDataService } from '@core/services/updated-general.service';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, RouterLinkActive,PhoneFormatPipe]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLanguageMenuOpen = false;
  isProfileMenuOpen = false;
  isMobileMenuOpen = false;
  isTabletMenuOpen = false;
  isMobileInsuranceOpen = false;
  isMobileProfileOpen = false;
  isScrolled = false;
  currentLanguage = 'EN';
  contactData: ContactData | null = null;
  expiringPoliciesCount: number = 0;
  pendingClaimsCount: number = 0;
  private contactDataSubscription: Subscription = new Subscription();
  private languageSubscription: Subscription = new Subscription();
  aboutDownload: any;

  // Enhanced scroll handling to prevent flickering
  private lastScrollY = 0;
  private scrollDirection: 'up' | 'down' | 'none' = 'none';
  private hideThreshold = 200; // Scroll down distance before hiding
  private showThreshold = 100; // Scroll up distance before showing
  private ticking = false;
  private scrollBuffer = 20; // Buffer to prevent small scroll changes from triggering state changes
  private isTransitioning = false; // Prevent state changes during transitions
  private stateChangeDelay = 100; // Delay before allowing next state change

  constructor(
    private router: Router,
    public languageService: LanguageService,
    public authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private genericDataService: UpdatedGenericDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Initialize scroll position only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScrollState();
    }

    // Language subscription
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang.toUpperCase();
      this.cdr.detectChanges();
    });

    // Contact data subscription
    this.contactDataSubscription = this.genericDataService.contactData$.subscribe(data => {
      console.log('Received contactData:', data); // Debug log
      if (data && data.contact) {
        this.contactData = data.contact;
        console.log(this.contactData);
        console.log(this.contactData);
        this.cdr.detectChanges();
      }
      if(isPlatformBrowser(this.platformId)){
        localStorage.setItem('contactData', JSON.stringify(this.contactData));
        console.log("data", this.contactData);
      }
    });

    // Fetch contact data if not already loaded
    this.genericDataService.getContactData().subscribe({
      error: err => console.error('Contact data fetch error:', err) // Debug error
    });

    // Get number of policies expiring soon
    this.notificationService.checkExpiringPoliciesOnInit().subscribe(count => {
      this.expiringPoliciesCount = count;
      this.cdr.detectChanges();
    });

    this.genericDataService.getAboutDownload().subscribe(data => {
      this.aboutDownload = data;

      if(isPlatformBrowser(this.platformId)){
        localStorage.setItem('aboutDownload', JSON.stringify(this.aboutDownload));
        console.log("data", this.aboutDownload);
      }
      this.aboutDownload = data.elwinsh_link;
      console.log("winch",this.aboutDownload)
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
    this.contactDataSubscription.unsubscribe();
  }

  private initializeScrollState(): void {
    this.lastScrollY = this.getCurrentScrollY();
    this.isScrolled = this.lastScrollY > this.hideThreshold;
    this.cdr.detectChanges();
  }

  private getCurrentScrollY(): number {
    if (isPlatformBrowser(this.platformId)) {
      return Math.max(0, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
    }
    return 0; // Return 0 for server-side rendering
  }

  private updateScrollState(): void {
    // Prevent updates during transitions to avoid flickering
    if (this.isTransitioning) {
      return;
    }

    const currentScrollY = this.getCurrentScrollY();
    const scrollDifference = currentScrollY - this.lastScrollY;

    // Only process significant scroll changes to prevent micro-adjustments
    if (Math.abs(scrollDifference) < this.scrollBuffer) {
      return;
    }

    // Determine scroll direction
    const newDirection: 'up' | 'down' | 'none' = scrollDifference > 0 ? 'down' : scrollDifference < 0 ? 'up' : 'none';
    
    // Only update if direction actually changed significantly
    if (newDirection !== 'none') {
      this.scrollDirection = newDirection;
    }

    const wasScrolled = this.isScrolled;
    let shouldUpdateState = false;

    // Logic for hiding navbar (scrolling down)
    if (this.scrollDirection === 'down' && currentScrollY > this.hideThreshold && !this.isScrolled) {
      this.isScrolled = true;
      shouldUpdateState = true;
    }
    // Logic for showing navbar (scrolling up or at top)
    else if ((this.scrollDirection === 'up' && currentScrollY < this.lastScrollY - this.showThreshold) || currentScrollY <= 50) {
      if (this.isScrolled) {
        this.isScrolled = false;
        shouldUpdateState = true;
      }
    }

    // Always show when at the very top
    if (currentScrollY <= 10 && this.isScrolled) {
      this.isScrolled = false;
      shouldUpdateState = true;
    }

    // Only update if state actually changed
    if (shouldUpdateState && wasScrolled !== this.isScrolled) {
      this.isTransitioning = true;
      this.cdr.detectChanges();
      
      // Allow next state change after delay
      setTimeout(() => {
        this.isTransitioning = false;
      }, this.stateChangeDelay);
    }

    this.lastScrollY = currentScrollY;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId) && !this.ticking) {
      this.ticking = true;
      
      requestAnimationFrame(() => {
        this.updateScrollState();
        this.ticking = false;
      });
    }
  }

  // Reset scroll state method
  resetScrollState(): void {
    this.isScrolled = false;
    this.lastScrollY = 0;
    this.scrollDirection = 'none';
    this.isTransitioning = false;
    this.cdr.detectChanges();
  }

  getAddress(): string {
    if (!this.contactData) return '';
    return this.currentLanguage === 'en' 
      ? this.contactData.en_address 
      : this.contactData.ar_address;
  }

  callPhone(phoneNumber: string | undefined): void {
    if (!phoneNumber) return;
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `tel:${phoneNumber}`;
    }
  }

  sendEmail(email: string | undefined): void {
    if (!email) return;
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `mailto:${email}`;
    }
  }

  selectLanguage(lang: string): void {
    const langCode = lang.toLowerCase();
    console.log(langCode);
    this.languageService.changeLanguage(langCode === 'en' ? 'ar' : 'en', this.router.url);
    this.isLanguageMenuOpen = false;
  }

  toggleMenu(event: Event): void {
    event.preventDefault();
    this.isMenuOpen = !this.isMenuOpen;
    this.isLanguageMenuOpen = false;
    this.isProfileMenuOpen = false;
  }
  
  selectLanguage2(lang: string): void {
    const langCode = lang.toLowerCase();
    this.languageService.changeLanguage(langCode, this.router.url);
    this.isLanguageMenuOpen = false;
  }
  
  toggleLanguageMenu(event: Event): void {
    event.stopPropagation();
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
    this.isMenuOpen = false;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isMenuOpen = false;
    this.isLanguageMenuOpen = false;
  }

  selectOption(option: string): void {
    console.log('Selected Insurance Option:', option);
    
    this.isMenuOpen = false;
    this.isTabletMenuOpen = false;
  }
  
  getEncodedAddress(): string {
    const address = this.getAddress();
    return encodeURIComponent(address);
  }
  
  selectProfileOption(option: string): void {
    const lang = this.currentLanguage.toLowerCase();
    switch (option) {
      case 'my-policies':
        this.router.navigate([`/${lang}/policies`]);
        break;
      case 'my-claims':
        this.router.navigate([`/${lang}/claims`]);
        break;
      case 'profile':
        this.router.navigate([`/${lang}/profile`]);
        break;
      case 'logout':
        this.authService.logout().subscribe(() => {
          this.router.navigate([`/${lang}/login`]);
        });
        break
        case "notification":
          this.router.navigate([`/${lang}/notifications`]);
        break;
    }
    this.isProfileMenuOpen = false;
    this.isMobileProfileOpen = false;
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isMobileInsuranceOpen = false;
    this.isMobileProfileOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isMobileInsuranceOpen = false;
    this.isMobileProfileOpen = false;
  }

  toggleTabletMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isTabletMenuOpen = !this.isTabletMenuOpen;
  }

  redirect(): void {
    const lang = this.currentLanguage.toLowerCase();
    this.router.navigate([`/${lang}/${lang === 'en' ? 'english-blogs' : 'arabic-blogs'}`]);
  }

  toggleMobileInsuranceMenu(): void {
    this.isMobileInsuranceOpen = !this.isMobileInsuranceOpen;
    this.isMobileProfileOpen = false;
  }

  toggleMobileProfileMenu(): void {
    this.isMobileProfileOpen = !this.isMobileProfileOpen;
    this.isMobileInsuranceOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (isPlatformBrowser(this.platformId) && event.target instanceof Element) {
      if (!event.target.closest('.nav-link.group') &&
          !event.target.closest('.language-dropdown-container') &&
          !event.target.closest('.profile-dropdown-container')) {
        this.isMenuOpen = false;
        this.isLanguageMenuOpen = false;
        this.isProfileMenuOpen = false;
      }
      if (!event.target.closest('.mobile-nav-link')) {
        this.isTabletMenuOpen = false;
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
      this.isMenuOpen = false;
      this.isLanguageMenuOpen = false;
      this.isProfileMenuOpen = false;
    }
  }
}