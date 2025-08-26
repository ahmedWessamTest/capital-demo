import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { PoliciesService, UserPoliciesResponse } from '@core/services/profile/user-policies.service';
import { ClaimsService, UserClaimsResponse } from '@core/services/profile/user-claims.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private expiringPolicies = new BehaviorSubject<any[]>([]);
  expiringPolicies$ = this.expiringPolicies.asObservable();
  private authService = inject(AuthService);
  private policiesService = inject(PoliciesService);
  private claimsService = inject(ClaimsService);

  setExpiringPolicies(policies: any[]) {
    this.expiringPolicies.next(policies);
  }

  checkExpiringPoliciesOnInit(): Observable<number> {
    if (!this.authService.isAuthenticated()) {
      return of(0);
    }
    const userId = +this.authService.getUserId();
    if (!userId) {
      return of(0);
    }
    return this.policiesService.getUserPolicies(userId).pipe(
      switchMap((data: UserPoliciesResponse) => {
        const expiringPolicies = [
          ...data.medical.filter((policy) => this.isExpiringSoon(policy.end_date) && this.getPolicyStatus(policy) === 'Running'),
          ...data.motor.filter((policy) => this.isExpiringSoon(policy.end_date) && this.getPolicyStatus(policy) === 'Running'),
          ...data.building.filter((policy) => this.isExpiringSoon(policy.end_date) && this.getPolicyStatus(policy) === 'Running'),
        ];
        this.setExpiringPolicies(expiringPolicies);
        return of(expiringPolicies.length);
      })
    );
  }

  checkPendingClaims(): Observable<number> {
    if (!this.authService.isAuthenticated()) {
      return of(0);
    }
    const userId = +this.authService.getUserId();
    if (!userId) {
      return of(0);
    }
    return this.claimsService.getUserClaims(userId).pipe(
      switchMap((data: UserClaimsResponse) => {
        const pendingClaims = [
          ...data.medical.filter((claim) => claim.status === 'pending' || claim.status === 'requested'),
          ...data.motor.filter((claim) => claim.status === 'pending' || claim.status === 'requested'),
          ...data.building.filter((claim) => claim.status === 'pending' || claim.status === 'requested'),
        ];
        return of(pendingClaims.length);
      })
    );
  }

  private formatInputDate(date: string | null): Date | null {
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

  private isExpiringSoon(date: string | null): boolean {
    const endDate = this.formatInputDate(date);
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(today.getDate() + 10);
    return endDate >= today && endDate <= tenDaysFromNow;
  }

  private getPolicyStatus(policy: any): string {
    const isCanceled = policy.active_status === 'canceled';
    const endDate = this.formatInputDate(policy.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isCanceled) return 'Canceled';
    if (!endDate || endDate < today) return 'Expired';
    return 'Running';
  }
}