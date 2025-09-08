import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable } from 'rxjs';

export interface addCorporateUnitForm {
  user_id: string;
  policy_id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}
export interface EmpLoyeesData {
  id: number
  user_id: number
  category_id: number
  medical_insurance_id: any
  payment_method: string
  medical_insurance_number: any
  admin_medical_insurance_number: any
  name: string
  email: string
  phone: string
  birthdate: any
  gender: any
  company_id: number
  company_name: string
  company_employee_number: number
  company_employee_avg: string
  company_address: string
  request_type: string
  start_date: string
  duration: any
  end_date: any
  total_year_money: any
  total_month_money: any
  active_status: string
  created_at: string
  updated_at: string
}
export type corporateEndPoints = 'company-medical' | "company-jop" | "company-building";
@Injectable({
  providedIn: 'root'
})
export class CorporateDetailsService {
  private readonly _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;
  submitCorporateUnit(companyPath: corporateEndPoints, policyData: addCorporateUnitForm): Observable<any> {
    return this._http.post(`${this.baseUrl}${companyPath}/store`, policyData);
  }
  deleteCorporateUnit(companyPath: corporateEndPoints, policy_id: number): Observable<any> {
    return this._http.post(`${this.baseUrl}${companyPath}/delete`, { policy_id });
  }
  getCorporateUnit(companyPath: corporateEndPoints, policy_id: string): Observable<any> {
    return this._http.post(`${this.baseUrl}${companyPath}/empolyee-policy`, { policy_id });
  }
}
