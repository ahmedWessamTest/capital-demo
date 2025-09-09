import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable } from 'rxjs';
import { JobInsurancePolicy } from 'src/app/website-pages/policies/job-insurance/res/JobInsurancePolicy';

export interface JopPolicyData {
  category_id: string;
  user_id: string;
  jop_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  jop_title: string;
  jop_price: string;
  jop_main_id: File;
  jop_second_id?: File;
  payment_method: string;
  active_status: string;
}
export interface JopPolicyDataCorporate {
  category_id: string;
  user_id: string;
  jop_insurance_id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  company_employee_number: number;
  company_employee_avg: number;
  company_employee_total_money: number;
  company_address: string;
  jop_title: string;
  payment_method: string;
  active_status: string;
  lead_type: 'corporate';
  request_type: 'corporate';

}
@Injectable({
  providedIn: 'root',
})
export class JopPolicyService {
  private httpClient: HttpClient = inject(HttpClient);
  /* Leads */
  createLead(formData: any) {
    return this.httpClient.post(
      `${API_CONFIG.BASE_URL}app-leads/jop-lead`,
      formData
    );
  }

  getLead(userId: number) {
    return this.httpClient.get(
      `${API_CONFIG.BASE_URL}app-leads/jop-get/${userId}`
    );
  }

  updateLead(id: number, formData: any) {
    return this.httpClient.post(
      `${API_CONFIG.BASE_URL}app-leads/jop-update/${id}`,
      formData
    );
  }

  /* Policies */
  getInsurancePolicies(empNum?: any): Observable<JobInsurancePolicy> {
    const params: any = { type: 'jop', ...(empNum && { employee_number: empNum }) };
    return this.httpClient.get<JobInsurancePolicy>(
      `${API_CONFIG.BASE_URL}app-policies/policies-content/5`,
      {
        params,
      }
    );
  }

  getInsuranceChoices(insuranceId: number): Observable<any> {
    return this.httpClient.get<any>(
      `${API_CONFIG.BASE_URL}app-policies/policies-choices/${insuranceId}`
    );
  }

  storePolicy(formData: any) {
    return this.httpClient.post(
      `${API_CONFIG.BASE_URL}app-policies/policies-jop-store`,
      formData
    );
  }

  /* Claims */
  createJobClaim(formData: FormData): Observable<any> {
    return this.httpClient.post(
      `${API_CONFIG.BASE_URL}app-claims/claim-jop-store`,
      formData
    );
  }
}
