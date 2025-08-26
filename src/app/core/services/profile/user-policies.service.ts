import { HttpClient, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable } from 'rxjs';

// Interfaces for User Policies
export interface MedicalPolicy {
  id: number;
  user_id: number;
  category_id: number;
  medical_insurance_id: number;
  payment_method: string;
  medical_insurance_number: string;
  admin_medical_insurance_number: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  start_date: string;
  duration: string;
  end_date: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface MotorPolicy {
  id: number;
  user_id: number;
  category_id: number;
  motor_insurance_id: number;
  payment_method: string;
  motor_insurance_number: string;
  admin_motor_insurance_number: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  car_type_id: number;
  car_type: string;
  car_brand_id: number;
  car_brand: string;
  car_model_id: number;
  car_model: string;
  car_year_id: number;
  car_year: string;
  car_price: string;
  start_date: string;
  duration: string;
  end_date: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface BuildingPolicy {
  id: number;
  user_id: number;
  category_id: number;
  building_insurance_id: number;
  payment_method: string;
  building_insurance_number: string;
  admin_building_insurance_number: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  building_type_id: number;
  building_type: string;
  building_country_id: number;
  building_country: string;
  building_city: string;
  building_price: string;
  start_date: string;
  duration: string;
  end_date: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}
export interface JopPolicyView {
  id: number;
  user_id: number;
  category_id: number;
  jop_insurance_id: number;
  payment_method: string;
  jop_insurance_number: string;
  admin_medical_insurance_number: any;
  name: string;
  email: string;
  phone: string;
  jop_title: string;
  jop_price: number;
  jop_main_id: string;
  jop_second_id: string;
  start_date: any;
  duration: any;
  end_date: any;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface UserPoliciesResponse {
  user: any;
  medical: MedicalPolicy[];
  motor: MotorPolicy[];
  building: BuildingPolicy[];
  jop: JopPolicyView[];
}

// Interfaces for Policy Comments
export interface PolicyComment {
  id: number;
  user_id: number;
  user_role: string;
  user_name: string;
  comment: string;
  comment_file: string | null;
  comment_date: string;
  reciver_id: number;
  reciver_role: string;
  reciver_name: string;
  request_id: number;
  request_status: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyWithComments {
  id: number;
  user_id: number;
  category_id: number;
  medical_insurance_id: number;
  payment_method: string;
  medical_insurance_number: string;
  admin_medical_insurance_number: string;
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  start_date: string;
  duration: string;
  end_date: string;
  active_status: string;
  created_at: string;
  updated_at: string;
  comments: PolicyComment[];
}

export interface PolicyCommentsResponse {
  policy: PolicyWithComments;
}

export interface CreatePolicyCommentPayload {
  user_id: number;
  user_role: string;
  user_name: string;
  comment: string;
  comment_file?: File | null;
  reciver_id: number;
  reciver_role: string;
  reciver_name: string;
  request_id: number;
  request_status: string;
}

// Interface for Policy Choices Response
export interface PolicyChoicesResponse {
  policy: {
    id: number;
    category_id: number;
    en_title: string;
    ar_title: string;
    year_money: string;
    month_money: string;
    company_name: string;
    active_status: string;
    created_at: string;
    updated_at: string;
    medicalchoices?: Array<{
      id: number;
      category_id: number;
      medical_insurance_id: number;
      en_title: string;
      ar_title: string;
      en_description: string | null;
      ar_description: string | null;
      active_status: string;
      created_at: string;
      updated_at: string;
    }>;
    motorchoices?: Array<any>; // Define if needed
    buildingchoices?: Array<any>; // Define if needed
    jopchoices?: Array<any>; // Define if needed
  };
}

@Injectable({
  providedIn: 'root',
})
export class PoliciesService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  // Get all user policies
  getUserPolicies(userId: number): Observable<UserPoliciesResponse> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const params = {
      type: 'all',
    };
    return this._http.get<UserPoliciesResponse>(
      `${this.baseUrl}app-profile/userpolicy/${userId}`,
      { params }
    );
  }

  // Get single policy with comments
  getPolicyWithComments(
    policyId: number,
    type: string
  ): Observable<PolicyCommentsResponse> {
    const params = {
      type: type,
    };
    if (!policyId) {
      throw new Error('Policy ID is required');
    }
    return this._http.get<PolicyCommentsResponse>(
      `${this.baseUrl}app-policies/policy-single/${policyId}`,
      { params }
    );
  }

  // Create medical policy comment
  createMedicalPolicyComment(
    policyId: number,
    payload: CreatePolicyCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-policies/medical-comment/${policyId}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create motor policy comment
  createMotorPolicyComment(
    policyId: number,
    payload: CreatePolicyCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-policies/motor-comment/${policyId}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create building policy comment
  createBuildingPolicyComment(
    policyId: number,
    payload: CreatePolicyCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-policies/building-comment/${policyId}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create job policy comment
  createJopPolicyComment(
    policyId: number,
    payload: CreatePolicyCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-policies/jop-comment/${policyId}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Get policy choices (medical, motor, or building)
  getPolicyChoices(
    policyId: number,
    type: 'medical' | 'motor' | 'building' | 'jop'
  ): Observable<PolicyChoicesResponse> {
    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    if (!type) {
      throw new Error('Policy type is required');
    }
    const params = {
      type: type,
    };
    return this._http.get<PolicyChoicesResponse>(
      `${this.baseUrl}app-policies/policies-choices/${policyId}`,
      { params }
    );
  }

  // Helper method to validate comment payload
  private validateCommentPayload(payload: CreatePolicyCommentPayload): void {
    if (!payload.user_id) throw new Error('user_id is required');
    if (!payload.user_role) throw new Error('user_role is required');
    if (!payload.user_name) throw new Error('user_name is required');
    if (!payload.comment) throw new Error('comment is required');
    if (!payload.reciver_id) throw new Error('reciver_id is required');
    if (!payload.reciver_role) throw new Error('reciver_role is required');
    if (!payload.reciver_name) throw new Error('reciver_name is required');
    if (!payload.request_id) throw new Error('request_id is required');
    if (!payload.request_status) throw new Error('request_status is required');
  }

  // Helper method to create FormData
  private createFormData(payload: CreatePolicyCommentPayload): FormData {
    const formData = new FormData();

    formData.append('user_id', payload.user_id.toString());
    formData.append('user_role', payload.user_role);
    formData.append('user_name', payload.user_name);
    formData.append('comment', payload.comment);
    formData.append('reciver_id', payload.reciver_id.toString());
    formData.append('reciver_role', payload.reciver_role);
    formData.append('reciver_name', payload.reciver_name);
    formData.append('request_id', payload.request_id.toString());
    formData.append('request_status', payload.request_status);

    if (payload.comment_file) {
      formData.append('comment_file', payload.comment_file);
    }

    return formData;
  }
}
