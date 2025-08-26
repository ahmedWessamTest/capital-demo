import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import {
  ClaimsService,
  UserClaimsResponse,
} from '@core/services/profile/user-claims.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './user-claims.component.html',
  styleUrls: ['./user-claims.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('loading', style({ opacity: 0.7 })),
      state('loaded', style({ opacity: 1 })),
      transition('loading => loaded', [animate('0.5s ease-in')]),
      transition('loaded => loading', [animate('0.3s ease-out')]),
    ]),
  ],
})
export class UserClaimsComponent implements OnInit {
  activeTab: 'open' | 'closed' = 'open';
  claims: UserClaimsResponse = {
    user: null,
    medical: [],
    motor: [],
    building: [],
    jop: [],
  };
  isLoading = true;
  pendingCount = 0;
  private claimsService = inject(ClaimsService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private _languageService = inject(LanguageService);
  public translate = inject(TranslateService);
  readonly claimTypes = ['medical', 'motor', 'building', 'jop'] as const;
  currentLang$ = this._languageService.currentLanguage$;
  lang: string = 'en';
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/', this._languageService.getCurrentLanguage()]);
        return;
      }
      this.fetchClaims();
    }
    this._languageService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
      this.cdr.markForCheck();
    });
  }

  fetchClaims() {
    const userId = +this.authService.getUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.claimsService.getUserClaims(userId).subscribe({
      next: (data) => {
        this.claims = data;
        this.pendingCount = this.calculatePendingCount();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private calculatePendingCount(): number {
    return [
      ...this.claims.medical.filter(
        (claim) => claim.status === 'pending' || claim.status === 'requested'
      ),
      ...this.claims.motor.filter(
        (claim) => claim.status === 'pending' || claim.status === 'requested'
      ),
      ...this.claims.building.filter(
        (claim) => claim.status === 'pending' || claim.status === 'requested'
      ),
      ...this.claims.jop.filter(
        (claim) => claim.status === 'pending' || claim.status === 'requested'
      ),
    ].length;
  }

  switchTab(tab: 'open' | 'closed') {
    this.activeTab = tab;
  }

  formatInputDate(date: string | null): Date | null {
    if (!date) return null;

    // Try parsing as ISO date first
    let parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Fallback to existing logic for YYYY-MM-DD or DD-MM-YYYY
    const dateParts = date.split(/[-\/]/);
    let year: number, month: number, day: number;
    if (dateParts[0].length === 4) {
      [year, month, day] = dateParts.map(Number);
    } else if (dateParts[2].length === 4) {
      [day, month, year] = dateParts.map(Number);
    } else {
      return null;
    }
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    parsedDate = new Date(year, month - 1, day);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  formatDisplayDate(date: string | null): string {
    const parsedDate = this.formatInputDate(date);
    if (!parsedDate) return 'N/A';
    const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
    const formattedMonth = parsedDate.toLocaleString('en-US', {
      month: 'long',
    });
    const formattedYear = parsedDate.getFullYear();
    return `${formattedDay}, ${formattedMonth} ${formattedYear}`;
  }

  getAllClaimsSorted() {
    // Combine all claims from all types with their type information
    const allClaims = [
      ...this.claims.medical.map((c) => ({ ...c, type: 'medical' as const })),
      ...this.claims.motor.map((c) => ({ ...c, type: 'motor' as const })),
      ...this.claims.building.map((c) => ({ ...c, type: 'building' as const })),
      ...this.claims.jop.map((c) => ({ ...c, type: 'jop' as const })),
    ];

    // Filter based on active tab
    const filtered = allClaims.filter((claim) => {
      const isOpen =
        claim.status === 'pending' ||
        claim.status === 'requested' ||
        claim.status === 'confirmed';
      return this.activeTab === 'open'
        ? isOpen
        : claim.status === 'canceled' || claim.status === 'expired';
    });

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = this.formatInputDate(a.created_at) || new Date(0);
      const dateB = this.formatInputDate(b.created_at) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  getClaimStatus(claim: any): string {
    return (
      claim.status.charAt(0).toUpperCase() +
      claim.status.slice(1).replace('_', ' ')
    );
  }

  getClaimTypeName(type: 'medical' | 'motor' | 'building' | 'jop'): string {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Claim';
  }

  getClaimCode(
    claim: any,
    type: 'medical' | 'motor' | 'building' | 'jop'
  ): string {
    return claim.claim_number;
  }
}
