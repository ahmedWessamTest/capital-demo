import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '@core/services/language.service';
import { API_CONFIG } from '@core/conf/api.config';
import { TranslateModule } from '@ngx-translate/core';

interface PrivacyPolicyResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    en_title: string;
    ar_title: string;
    en_description: string;
    ar_description: string;
    created_at: string;
    updated_at: string;
  };
}

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  privacyPolicy$: Observable<PrivacyPolicyResponse | null>;
  isArabic: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private languageService: LanguageService
  ) {
    this.privacyPolicy$ = this.http.get<PrivacyPolicyResponse>(`${API_CONFIG.BASE_URL}privacy-policy`);
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.pipe(takeUntil(this.destroy$)).subscribe((language) => {
      this.isArabic = language === 'ar';
    });

    this.privacyPolicy$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => console.error('Error fetching privacy policy:', err)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}