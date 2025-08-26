import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from '@core/services/language.service'; // adjust path as needed
import {
  ClaimInfo,
  Feature,
  UpdatedGenericDataService,
} from '@core/services/updated-general.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HomeFormComponent } from '../../home/home-form/home-form.component';

@Component({
  selector: 'app-claim-info',
  standalone: true,
  imports: [TranslateModule, HomeFormComponent],
  templateUrl: './claim-info.component.html',
  styleUrl: './claim-info.component.css',
})
export class ClaimInfoComponent implements OnInit, OnDestroy {
  claimInfo: ClaimInfo | null = null;
  features: Feature[] = [];
  currentLang: string = 'en';
  private langSub!: Subscription;

  // Inject services
  private generalService = inject(UpdatedGenericDataService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    this.loadClaimInfo();

    // Subscribe to language changes
    this.langSub = this.languageService.currentLanguage$.subscribe((lang) => {
      this.currentLang = lang;
      this.updateMetaTags();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  goBack() {
    history.back();
  }

  private loadClaimInfo(): void {
    this.generalService.getClaimInfoOnce(1).subscribe((data) => {
      this.claimInfo = data;
      this.updateMetaTags();
    });
    this.generalService.getFeatures().subscribe((data) => {
      this.features = data;
    });
  }

  private updateMetaTags(): void {
    if (!this.claimInfo) return;

    const metaTitle =
      this.currentLang === 'ar'
        ? this.claimInfo.ar_meta_title
        : this.claimInfo.en_meta_title;
    const metaText =
      this.currentLang === 'ar'
        ? this.claimInfo.ar_meta_text
        : this.claimInfo.en_meta_text;

    this.titleService.setTitle(metaTitle);
    this.metaService.updateTag({ name: 'description', content: metaText });
  }

  // Helpers for the template
  get mainTitle(): string {
    return this.currentLang === 'ar'
      ? this.claimInfo?.ar_main_title ?? ''
      : this.claimInfo?.en_main_title ?? '';
  }

  get mainText(): string {
    return this.currentLang === 'ar'
      ? this.claimInfo?.ar_main_text ?? ''
      : this.claimInfo?.en_main_text ?? '';
  }
}
