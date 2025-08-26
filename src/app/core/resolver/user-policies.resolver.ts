import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { UserPoliciesResponse, PoliciesService } from '@core/services/profile/user-policies.service';

@Injectable({
  providedIn: 'root',
})
export class UserPoliciesResolver implements Resolve<UserPoliciesResponse | null> {
  private policiesService = inject(PoliciesService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserPoliciesResponse | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null); // Return null for SSR to avoid server-side API calls
    }
    const userId = +this.authService.getUserId();
    if (!userId) {
      return of(null);
    }
    return this.policiesService.getUserPolicies(userId);
  }
}