import { CommonModule } from '@angular/common';
import { corporateEndPoints } from './../../../../core/services/policies/corporate-details.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CorporateDetailsService } from '@core/services/policies/corporate-details.service';
import { AuthStorageService } from '@core/services/auth/auth-storage.service';
import { AlertService } from '@core/shared/alert/alert.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-corporate-unit-form',
  imports: [ReactiveFormsModule, CommonModule,TranslateModule],
  templateUrl: './add-corporate-unit-form.component.html',
  styleUrl: './add-corporate-unit-form.component.css'
})
export class AddCorporateUnitFormComponent {
  form!: FormGroup;
  policyId!: string;
  policyType!: string;
  errorMessages: { phone: string, email: string } | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private CorporateDetailsService: CorporateDetailsService,
    private authStorage: AuthStorageService,
    private alertService: AlertService,
    private translate: TranslateService
  ) { }
  ngOnInit() {
    this.policyId = this.route.snapshot.paramMap.get('policyId')!;
    this.policyType = this.route.snapshot.paramMap.get('policyType')!;

    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^01(1|2|5|0)\d{8}$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    this.errorMessages = null;
    this.isSubmitting = true;
    const corporateType = ('company-' + this.policyType) as corporateEndPoints;

    const body = {
      ...this.form.value,
      user_id: this.authStorage.getUserData()?.id.toString(),
      policy_id: this.policyId,

    };
    this.CorporateDetailsService.submitCorporateUnit(corporateType, body).subscribe({
      next: (res) => {
        this.isSubmitting = false
        if (res.success) {
          this.alertService.showNotification({
            title: this.translate.instant("common.success"),
            messages: [this.translate.instant("pages.add_emp_form.alert.emp_added_success")],
            confirmText: this.translate.instant("common.ok"),
            onDismiss: () => this.alertService.hide()
          });

          setTimeout(() => {
            this.alertService.hide();
            this.router.navigate(['../'], { relativeTo: this.route });
          }, 2000);
        }
      },
      error: ((error) => {
        this.isSubmitting = false;
        console.error("Error in corporate unit form:", error);
        this.errorMessages = error?.error?.errors;
      })
    });
  }
  get f() {
    return this.form.controls;
  }
}
