import { CorporateDetailsService, corporateEndPoints, EmpLoyeesData } from '@core/services/policies/corporate-details.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarouselModule } from "ngx-owl-carousel-o";
import { LanguageService } from '@core/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertService } from '@core/shared/alert/alert.service';

@Component({
  selector: 'app-show-all-corporate-details-compoent',
  imports: [CommonModule, CarouselModule, RouterLink, TranslateModule],
  templateUrl: './show-all-corporate-details.component.html',
  styleUrl: './show-all-corporate-details.component.css'
})
export class ShowAllCorporateDetailsComponent {
  policyUnits: EmpLoyeesData[] = [];
  policyId!: string;
  skeletonRows = Array(2);
  policyType!: string;
  maxUnits: number | null = null;
  loading = true;
  sortDirection: 'asc' | 'desc' | '' = 'asc';
  constructor(
    private route: ActivatedRoute,
    private CorporateDetailsService: CorporateDetailsService,
    private LanguageService: LanguageService,
    private AlertService: AlertService,
    private translate: TranslateService
  ) { }
  currentLang$: any;
  ngOnInit() {
    this.currentLang$ = this.LanguageService.currentLanguage$
    this.policyId = this.route.snapshot.paramMap.get('policyId')!;
    this.policyType = this.route.snapshot.paramMap.get('policyType')!;
    this.loadUnits();
  }
  loadUnits() {
    const corporateType = "company-" + this.policyType as corporateEndPoints;
    this.loading = true;
    this.CorporateDetailsService.getCorporateUnit(corporateType, this.policyId).subscribe({
      next: (res: any) => {
        const unitsData = res.empolyeepolicy;
        if (unitsData.length > 0) {
          this.maxUnits = unitsData[0].company_employee_number
        }
        this.policyUnits = res.empolyeepolicy;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
  sortByUsername() {
    if (this.sortDirection === '' || this.sortDirection === 'desc') {
      this.sortDirection = 'asc';
      this.policyUnits.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.sortDirection = 'desc';
      this.policyUnits.sort((a, b) => b.name.localeCompare(a.name));
    }
  }
  onDelete(userId: number) {
    this.AlertService.showConfirmation({
      title: this.translate.instant("pages.show_all_details.delete_alert.delete_item"),
      messages: [this.translate.instant("pages.show_all_details.delete_alert.are_you_sure")],
      confirmText: this.translate.instant("pages.show_all_details.delete_alert.yes_delete"), // Yes, delete
      cancelText: this.translate.instant('common.cancel'),
      imagePath: "common/after-remove.webp",
      onConfirm: () => {
        this.deleteUser(userId);
      }
    })
  }
  deleteUser(userId: number): void {
    const corporateType = "company-" + this.policyType as corporateEndPoints;
    this.CorporateDetailsService.deleteCorporateUnit(corporateType, userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.policyUnits = this.policyUnits.filter(unit => unit.id !== userId)
        }
      }
    });
  }
}
