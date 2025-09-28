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
  computed,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { ClaimNotify, GeneralNotify, NotificationsResponse, NotificationsService, PolicyNotify } from '@core/services/notifications/notifications.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
type NotificationsType = 'general' | 'policies' | 'claims'; 
@Component({
  selector: 'app-notifications',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  animations: [
    trigger('fadeInOut', [
      state('loading', style({ opacity: 0.7 })),
      state('loaded', style({ opacity: 1 })),
      transition('loading => loaded', [animate('0.5s ease-in')]),
      transition('loaded => loading', [animate('0.3s ease-out')]),
    ]),
  ]})
export class NotificationsComponent implements OnInit,OnDestroy{
  private destroy$ = new Subject<void>()
 activeTab  = signal<NotificationsType>("general");
 
  allNotifications = signal<NotificationsResponse>({
    generalNotify: [],
      policyNotify: [],
      claimNotify: []
  }) ;
  isLoading = signal<boolean>(true);
  lang = signal<string>('en') ;
  currentTabNotification = computed<GeneralNotify[] | PolicyNotify[] | ClaimNotify[]>(()=>{
  switch(this.activeTab()) {
    case 'policies': return this.allNotifications().policyNotify;
    case 'claims' : return this.allNotifications().claimNotify;
    default: return this.allNotifications().generalNotify;
  }
 })
  private notificationService = inject(NotificationsService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private _languageService = inject(LanguageService);
  public translate = inject(TranslateService);
  currentLang$ = this._languageService.currentLanguage$;
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/', this._languageService.getCurrentLanguage()]);
        return;
      }
      this.fetchNotifications();
    }
    this._languageService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe((lang:string) => {
      this.lang.set(lang) ;
      this.cdr.markForCheck();
    });
  }

  fetchNotifications() {
    this.isLoading.set(true) ;
    this.notificationService.getNotifications().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log("Notifications:",data);
        this.allNotifications.set(data);
        this.isLoading.set(false) ;
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
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
    const formattedMonth = parsedDate.toLocaleString(`${this.lang() === "ar"?'ar-EG' : 'en-US'}`, {
      month: 'long',
    });
    const formattedYear = parsedDate.getFullYear();
    return `${formattedDay}, ${formattedMonth} ${formattedYear}`;
  }
  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }
  notificationRedirect(notification: any):void {
    let data: any  = this.activeTab() === 'policies' ?  notification.policy : notification.claim;
    const title = notification?.notification_title ?? '';
    if(this.activeTab() === 'policies') {
      if(title.includes('New Comment!')) {
this.router.navigate(['/',this.lang(),'policies',data.id,notification.request_type,'comments'])
      }else {
        this.router.navigate(['/',this.lang(),'policies',data.id,notification.request_type])
      }
    } else {
      // /en/claims/38/medical/comments
      this.router.navigate(['/',this.lang(),'claims',data.id,notification.request_type,'comments'])
    }
  }
  getNotificationLabel(notification:any):string {
    const isAr = this.lang() === 'ar';
    const title = notification?.notification_title ?? '';
    if (title.includes('New Comment!')) {
    return isAr ? 'اذهب الي التعليقات' : 'Go to comments';
  }
  if (title.includes('Update Alert!')) {
    if (this.activeTab() === 'policies') {
      return isAr ? 'اذهب الي الوثيقه' : 'Go to policy';
    }
    if (this.activeTab() === 'claims') {
      return isAr ? 'اذهب الي المطالبه' : 'Go to claim';
    }
  }
  return ""
  }
  getStatus(notification: GeneralNotify | PolicyNotify | ClaimNotify):string {
    if(this.activeTab() === "policies") {
      return (notification as PolicyNotify).policy.active_status;
    } else if (this.activeTab() === "claims") {
      return (notification as ClaimNotify).claim.status; 
    }
    return ''
  }
  getArabicStatus(notificationText:string):string {
    if(notificationText === "pending") {
      return "قيد الانتظار"
    } else if (notificationText === "confirmed") {
      return "تم الطلب"
    }else if (notificationText === "canceled") {
return "تم الإلغاء"
    }
    return notificationText
  }
}
