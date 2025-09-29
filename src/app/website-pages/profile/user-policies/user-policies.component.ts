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
  PoliciesService,
  UserPoliciesResponse,
} from '@core/services/profile/user-policies.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from "ngx-owl-carousel-o";

@Component({
  selector: 'app-user-policies',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CarouselModule],
  templateUrl: './user-policies.component.html',
  styleUrls: ['./user-policies.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('loading', style({ opacity: 0.7 })),
      state('loaded', style({ opacity: 1 })),
      transition('loading => loaded', [animate('0.5s ease-in')]),
      transition('loaded => loading', [animate('0.3s ease-out')]),
    ]),
  ],
})
export class UserPoliciesComponent implements OnInit {
  activeTab: 'current' | 'previous' = 'current';
  policies: UserPoliciesResponse = {
    user: null,
    medical: [],
    motor: [],
    building: [],
    jop: [],
  };
  isLoading = true;
  expiringSoonCount = 0;
  private policiesService = inject(PoliciesService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  readonly policyTypes = ['medical', 'motor', 'building', 'jop'] as const;
  currentLang$ = this.languageService.currentLanguage$;
  private cdr = inject(ChangeDetectorRef);
  lang: string = 'en';
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/', this.languageService.getCurrentLanguage()]);
        return;
      }
      this.fetchPolicies();
    }
    this.languageService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
    });
  }

  fetchPolicies() {
    const userId = +this.authService.getUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.policiesService.getUserPolicies(userId).subscribe({
      next: (data) => {
        this.policies = data;
        
        this.expiringSoonCount = this.calculateExpiringSoonCount();
        this.isLoading = false;
        this.cdr.markForCheck(); // Add this
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck(); // Add this
      },
    });
  }

  private calculateExpiringSoonCount(): number {
    
    return [
      ...this.policies.medical.filter(
        (policy) =>
          this.isExpiringSoon(policy.end_date) &&
          this.getPolicyStatus('medical', policy) === 'Running'
      ),
      ...this.policies.motor.filter(
        (policy) =>
          this.isExpiringSoon(policy.end_date) &&
          this.getPolicyStatus('motor', policy) === 'Running'
      ),
      ...this.policies.building.filter(
        (policy) =>
          this.isExpiringSoon(policy.end_date) &&
          this.getPolicyStatus('building', policy) === 'Running'
      ),
      ...this.policies.jop.filter(
        (policy) =>
          this.isExpiringSoon(policy.end_date) &&
          this.getPolicyStatus('jop', policy) === 'Running'
      ),
    ].length;
  }

  switchTab(tab: 'current' | 'previous') {
    this.activeTab = tab;
  }

  formatInputDate(date: string | null): Date | null {
    if (!date) return null;
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
    const parsedDate = new Date(year, month - 1, day);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  formatDisplayDate(date: string | null): string {
    const parsedDate = this.formatInputDate(date);
    if (!parsedDate) return this.translate.instant('pages.user_policies.na');
    const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
    const formattedMonth = parsedDate.toLocaleString('en-US', {
      month: 'long',
    });
    const formattedYear = parsedDate.getFullYear();
    return `${formattedDay}, ${formattedMonth} ${formattedYear}`;
  }

  isExpiringSoon(date: string | null): boolean {
    console.log(date);
    
    const endDate = this.formatInputDate(date);
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(today.getDate() + 10);
    return endDate >= today && endDate <= tenDaysFromNow;
  }

  getAllPoliciesSorted() {
    // Combine all policies from all types with their type information
    const allPolicies = [
      ...this.policies.medical.map((p) => ({ ...p, type: 'medical' as const })),
      ...this.policies.motor.map((p) => ({ ...p, type: 'motor' as const })),
      ...this.policies.building.map((p) => ({
        ...p,
        type: 'building' as const,
      })),
      ...this.policies.jop.map((p) => ({ ...p, type: 'jop' as const })),
    ];

    // Filter based on active tab
    const filtered = allPolicies.filter((policy) => {
  const isCanceled = policy.active_status === 'canceled';
  const isPending = policy.active_status === 'pending';
  const isRequested = policy.active_status === 'requested';
  const isConfirmed = policy.active_status === "confirmed";

  const endDate = this.formatInputDate(policy.end_date);
      console.log(isCanceled,isPending,isPending,isRequested,isConfirmed);
      
  if (this.activeTab === 'current') {
    return (
      !isCanceled&&(isPending ||
      isRequested ||
      (isConfirmed && (endDate !== null && endDate >= new Date())) || // confirmed with endDate
      (endDate && endDate >= new Date())
      )
    );
  } else {
    return (
      isCanceled ||
      (isConfirmed && !endDate) || // confirmed with null endDate يروح هنا
      (endDate && endDate < new Date())
    );
  }
});

     return filtered.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
  }

  getPolicyStatus(
    type: 'medical' | 'motor' | 'building' | 'jop',
    policy: any
  ): string {
    const isCanceled = policy.active_status === 'canceled';
    const isPending = policy.active_status === 'pending';
    const isRequested = policy.active_status === 'requested';
    const isConfirmed = policy.active_status === 'confirmed';
    const endDate = this.formatInputDate(policy.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isCanceled)
      return this.translate.instant('pages.user_policies.status.canceled');
    if (isPending)
      return this.translate.instant('pages.user_policies.status.pending');
    if (isRequested)
      return this.translate.instant('pages.user_policies.status.requested');
    if(isConfirmed) this.translate.instant('pages.user_policies.status.confirmed');
    if (!endDate || endDate < today)
      return this.translate.instant('pages.user_policies.status.expired');
    return this.translate.instant('pages.user_policies.status.running');
  }

  getPolicyTypeName(type: 'medical' | 'motor' | 'building' | 'jop'): string {
    return this.translate.instant(`pages.user_policies.types.${type}`);
  }

  getPolicyCode(
    policy: any,
    type: 'medical' | 'motor' | 'building' | 'jop'
  ): string {
    return type === 'medical'
      ? policy.medical_insurance_number
      : type === 'motor'
        ? policy.motor_insurance_number
        : type === 'building'
          ? policy.building_insurance_number
          : policy.jop_insurance_number;
  }
}
