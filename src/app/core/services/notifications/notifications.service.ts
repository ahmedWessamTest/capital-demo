import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable } from 'rxjs';
import { AuthStorageService } from '../auth/auth-storage.service';
export interface NotificationsResponse {
  generalNotify: GeneralNotify[]
  policyNotify: PolicyNotify[]
  claimNotify: ClaimNotify[]
}

export interface GeneralNotify {
  id: number
  user_id: any
  notification_title?: string
  notification_text?: string
  ar_notification_title: any
  ar_notification_text: any
  notification_date: string
  notification_time: string
  request_id: any
  request_type: any
  created_at: string
  updated_at: string
}

export interface PolicyNotify {
  id: number
  user_id: number
  notification_title: string
  notification_text: string
  ar_notification_title: any
  ar_notification_text: any
  notification_date: string
  notification_time: string
  request_id: number
  request_type: string
  created_at: string
  updated_at: string
  policy: Policy
}

export interface Policy {
  id: number
  user_id: number
  category_id: number
  policy_id: any
  building_insurance_id?: number
  payment_method: string
  building_insurance_number?: string
  admin_building_insurance_number?: string
  name: string
  email: string
  phone: string
  birthdate: any
  gender?: string
  building_type_id: any
  building_type?: string
  building_country_id: any
  building_country?: string
  building_city?: string
  building_price?: string
  company_id: any
  company_name?: string
  company_building_number?: number
  company_building_total_money?: string
  company_address?: string
  request_type?: string
  start_date?: string
  duration: string
  end_date?: string
  total_year_money?: string
  total_month_money?: string
  active_status: string
  expire_notification: number
  created_at: string
  updated_at: string
  jop_insurance_id?: number
  jop_insurance_number?: string
  admin_medical_insurance_number?: string
  jop_title?: string
  jop_price?: number
  jop_main_id?: string
  jop_second_id: any
  company_employee_number?: number
  company_employee_avg?: string
  company_employee_total_money: any
  medical_insurance_id?: number
  medical_insurance_number?: string
  motor_insurance_id?: number
  motor_insurance_number?: string
  admin_motor_insurance_number?: string
  car_type_id: any
  car_type?: string
  car_brand_id: any
  car_brand?: string
  car_model_id: any
  car_model?: string
  car_year_id: any
  car_year?: string
  car_price?: string
}

export interface ClaimNotify {
  id: number
  user_id: number
  notification_title: string
  notification_text: string
  ar_notification_title?: string
  ar_notification_text?: string
  notification_date: string
  notification_time: string
  request_id: number
  request_type: string
  created_at: string
  updated_at: string
  claim: Claim
}

export interface Claim {
  id: number
  user_id: number
  category_id: number
  claim_number: string
  claim_date: any
  jop_insurance_id: any
  jop_insurance_number: any
  name: string
  email: string
  phone: string
  jop_title: any
  jop_price: any
  jop_main_id: any
  jop_second_id: any
  description: string
  status: string
  created_at: string
  updated_at: string
  building_insurance_id: any
  building_insurance_number: any
  birthdate: any
  gender: any
  building_type_id: any
  building_type: any
  building_country_id: any
  building_country: any
  building_city: any
  building_price: any
  motor_insurance_id: any
  motor_insurance_number?: string
  car_type_id: any
  car_type?: string
  car_brand_id: any
  car_brand?: string
  car_model_id: any
  car_model?: string
  car_year_id: any
  car_year?: string
  car_price?: string
}


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly _http = inject(HttpClient);
  private readonly _AuthStorageService = inject(AuthStorageService)
  private readonly baseUrl = API_CONFIG.BASE_URL;
  getNotifications(): Observable<NotificationsResponse> {
      const userId = this._AuthStorageService.getUserData()?.id;
      const params = { user_id:userId ?? 0 };
      return this._http.get<NotificationsResponse>(
        `${this.baseUrl}getNotificationLog`,
        { params }
      );
    }
}
