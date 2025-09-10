import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CustomTranslatePipe } from '@core/pipes/translate.pipe';
import { LanguageService } from '@core/services/language.service';
import {
  PoliciesService,
  PolicyChoicesResponse,
  PolicyCommentsResponse,
} from '@core/services/profile/user-policies.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-show-all-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, CustomTranslatePipe],
  templateUrl: './show-all-details.component.html',
  styleUrls: ['./show-all-details.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ShowAllDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private policiesService = inject(PoliciesService);
  private platformId = inject(PLATFORM_ID);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  policyId: number | null = null;
  policyType: 'medical' | 'motor' | 'building' | 'jop' | null = null;
  policyDetails: any = null;
  policyChoices: PolicyChoicesResponse['policy'] | null = null;
  isLoading = true;
  error: string | null = null;
  currentLang$ = this.languageService.currentLanguage$;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('policyId');
      const type = params.get('policyType') as
        | 'medical'
        | 'motor'
        | 'building'
        | 'jop'
        | null;
      if (
        id &&
        type &&
        ['medical', 'motor', 'building', 'jop'].includes(type)
      ) {
        this.policyId = +id;
        this.policyType = type;
        this.fetchPolicyDetails();
      } else {
        this.error = this.translate.instant(
          'pages.show_all_details.errors.invalid_policy'
        );
        this.isLoading = false;
      }
    });
  }

  fetchPolicyDetails() {
    if (!this.policyId || !this.policyType) return;

    this.policiesService
      .getPolicyWithComments(this.policyId, this.policyType)
      .subscribe({
        next: (response: PolicyCommentsResponse) => {
          this.policyDetails = response.policy;
          this.fetchPolicyChoices();
        },
        error: (err) => {
          this.error = this.translate.instant(
            'pages.show_all_details.errors.load_policy_details'
          );
          this.isLoading = false;
          console.error('Error fetching policy details:', err);
        },
      });
  }

  fetchPolicyChoices() {
    if (!this.policyId || !this.policyType || !this.policyDetails) return;
    const insuranceId =
      this.policyType === 'medical'
        ? this.policyDetails.medical_insurance_id
        : this.policyType === 'motor'
        ? this.policyDetails.motor_insurance_id
        : this.policyType === 'jop'
        ? this.policyDetails.jop_insurance_id
        : this.policyDetails.building_insurance_id;

    this.policiesService
      .getPolicyChoices(insuranceId, this.policyType)
      .subscribe({
        next: (response: PolicyChoicesResponse) => {
          const policyData = (response as any).ploicy || response.policy;
          this.policyChoices = policyData;
          this.isLoading = false;
          console.log('Policy Choices:', this.policyChoices);
        },
        error: (err) => {
          this.error = this.translate.instant(
            'pages.show_all_details.errors.load_policy_choices'
          );
          this.isLoading = false;
          console.error('Error fetching policy choices:', err);
        },
      });
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

  formatDate(date: string | null): string {
    const parsedDate = this.formatInputDate(date);
    if (!parsedDate) return this.translate.instant('pages.show_all_details.na');
    const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
    const formattedMonth = parsedDate.toLocaleString('en-US', {
      month: 'long',
    });
    const formattedYear = parsedDate.getFullYear();
    return `${formattedDay}, ${formattedMonth} ${formattedYear}`;
  }

  getPolicyTypeName(): string {
    if (!this.policyType) return '';
    return this.translate.instant(
      `pages.show_all_details.types.${this.policyType}`
    );
  }

  getPolicyCode(): string {
    if (!this.policyDetails || !this.policyType) return '';
    return this.policyType === 'medical'
      ? this.policyDetails.medical_insurance_number
      : this.policyType === 'motor'
      ? this.policyDetails.motor_insurance_number
      : this.policyType === 'jop'
      ? this.policyDetails.jop_insurance_number
      : this.policyDetails.building_insurance_number;
  }

  getStatus(): string {
    if (!this.policyDetails) return '';
    if (!this.policyDetails.end_date) {
      return (
        this.translate.instant(
          `pages.show_all_details.status.${this.policyDetails.active_status.toLowerCase()}`
        ) || this.policyDetails.active_status
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = this.formatInputDate(this.policyDetails.end_date);
    if (!endDate)
      return this.translate.instant('pages.show_all_details.status.expired');
    return endDate >= today
      ? this.translate.instant('pages.show_all_details.status.running')
      : this.translate.instant('pages.show_all_details.status.expired');
  }

  getStatusDotClass(): string {
    if (!this.policyDetails) return 'bg-gray-600';
    if (!this.policyDetails.end_date) {
      const status = this.policyDetails.active_status.toLowerCase();
      switch (status) {
        case 'requested':
          return 'bg-blue-600';
        case 'pending':
          return 'bg-orange-300';
        case 'confirmed':
          return 'bg-[#30B479]';
        case 'canceled':
          return 'bg-red-600';
        default:
          return 'bg-gray-600';
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = this.formatInputDate(this.policyDetails.end_date);
    if (!endDate) return 'bg-red-600';
    return endDate >= today ? 'bg-[#30B479]' : 'bg-red-600';
  }

  isExpiringSoon(): boolean {
    if (!this.policyDetails || !this.policyDetails.end_date) return false;
    const endDate = this.formatInputDate(this.policyDetails.end_date);
    if (!endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(today.getDate() + 10);
    return (
      endDate >= today &&
      endDate <= tenDaysFromNow &&
      this.getStatus() ===
        this.translate.instant('pages.show_all_details.status.running')
    );
  }

  getPolicyDetailsFields(): { label: string; value: any }[] {
    if (!this.policyDetails || !this.policyType) return [];
    console.log('Policy Details:', this.policyDetails);
    
    const fieldsToExclude = [
      'id',
      'policy_id',
      'created_at',
      'updated_at',
      'created_date',
      'updated_date',
      'start_date',
      'end_date',
      'medical_insurance_id',
      'motor_insurance_id',
      'building_insurance_id',
      'jop_insurance_id',
      'comments',
      'admin_building_insurance_number',
      'admin_medical_insurance_number',
      'admin_motor_insurance_number',
      'active_status',
      "total_month_money",
    ];

    const details = Object.entries(this.policyDetails)
      .filter(([key, value]) => {
        return (
          value != null &&
          !fieldsToExclude.includes(key) &&
          !key.toLowerCase().includes('id') &&
          !key.toLowerCase().includes('date')
        );
      })
      .map(([key, value]) => {
        let label = this.translate.instant(
          `pages.show_all_details.labels.${key}`,
          {
            default: key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase()),
          }
        );
        let formattedValue =
          typeof value === 'string' ? value : JSON.stringify(value);

        if (key === 'duration') {
          formattedValue = this.translate.instant(
            value === '1'
              ? 'pages.show_all_details.duration.singular'
              : 'pages.show_all_details.duration.plural',
            { count: value }
          );
        }
        if (key === 'active_status') {
          label = this.translate.instant(
            'pages.show_all_details.labels.status'
          );
        }

        return {
          label,
          value:
            formattedValue ||
            this.translate.instant('pages.show_all_details.na'),
        };
      });

    return details;
  }
}
