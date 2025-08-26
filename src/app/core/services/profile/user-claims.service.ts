import { HttpClient, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '@core/conf/api.config';
import { Observable } from 'rxjs';

// Interfaces for User Claims (same as before)
export interface MedicalClaim {
  id: number;
  user_id: number;
  category_id: number;
  claim_number: string;
  claim_date: string | null;
  medical_insurance_id: number | null;
  medical_insurance_number: string | null;
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  gender: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MotorClaim {
  id: number;
  user_id: number;
  category_id: number;
  claim_number: string;
  claim_date: string | null;
  motor_insurance_id: number | null;
  motor_insurance_number: string | null;
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  gender: string | null;
  car_type_id: number | null;
  car_type: string | null;
  car_brand_id: number | null;
  car_brand: string | null;
  car_model_id: number | null;
  car_model: string | null;
  car_year_id: number | null;
  car_year: string | null;
  car_price: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BuildingClaim {
  id: number;
  user_id: number;
  category_id: number;
  claim_number: string;
  claim_date: string | null;
  building_insurance_id: number | null;
  building_insurance_number: string | null;
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  gender: string | null;
  building_type_id: number | null;
  building_type: string | null;
  building_country_id: number | null;
  building_country: string | null;
  building_city: string | null;
  building_price: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JopClaim {
  id: number;
  user_id: number;
  category_id: number;
  claim_number: string;
  claim_date: string | null;
  name: string;
  email: string;
  phone: string;
  status: string;
  description: string;
  jop_title: string;
  jop_price: string;
  jop_main_id?: string | null;
  jop_second_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserClaimsResponse {
  user: any; // You can define a proper interface if needed
  medical: MedicalClaim[];
  motor: MotorClaim[];
  building: BuildingClaim[];
  jop: JopClaim[];
}

// Interfaces for Claim Comments (same as before)
export interface ClaimComment {
  id: number;
  user_id: number;
  user_role: string;
  user_name: string;
  comment: string;
  comment_file: string | null;
  comment_date: string | null;
  reciver_id: number;
  reciver_role: string;
  reciver_name: string;
  claim_id: number;
  claim_number: string;
  claim_status: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimWithComments {
  id: number;
  user_id: number;
  category_id: number;
  claim_number: string;
  claim_date: string | null;
  medical_insurance_id: number | null;
  medical_insurance_number: string | null;
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  gender: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  comments: ClaimComment[];
}

export interface ClaimCommentsResponse {
  claim: ClaimWithComments;
}

export interface CreateCommentPayload {
  user_id: number;
  user_role: string;
  user_name: string;
  comment: string;
  comment_file?: File | null;
  reciver_id: number;
  reciver_role: string;
  reciver_name: string;
  claim_number: string;
  claim_status: string;
  claim_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClaimsService {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  // Get all user claims
  getUserClaims(userId: number): Observable<UserClaimsResponse> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const params = { type: 'all' };
    return this._http.get<UserClaimsResponse>(
      `${this.baseUrl}app-profile/userclaims/${userId}`,
      { params }
    );
  }

  // Get single claim with comments
  getClaimWithComments(
    claimId: number,
    type: string
  ): Observable<ClaimCommentsResponse> {
    if (!claimId) {
      throw new Error('Claim ID is required');
    }
    const params = { type: type };
    return this._http.get<ClaimCommentsResponse>(
      `${this.baseUrl}app-claims/claim-single/${claimId}`,
      { params }
    );
  }

  // Create medical claim comment
  createMedicalClaimComment(
    claimId: number,
    payload: CreateCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-claims/medical-comment`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create motor claim comment
  createMotorClaimComment(
    claimId: number,
    payload: CreateCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-claims/motor-comment`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create building claim comment
  createBuildingClaimComment(
    claimId: number,
    payload: CreateCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-claims/building-comment`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Create job claim comment
  createJopClaimComment(
    claimId: number,
    payload: CreateCommentPayload
  ): Observable<any> {
    this.validateCommentPayload(payload);
    const formData = this.createFormData(payload);
    const request = new HttpRequest(
      'POST',
      `${this.baseUrl}app-claims/jop-comment`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );
    return this._http.request(request);
  }

  // Helper method to validate comment payload
  private validateCommentPayload(payload: CreateCommentPayload): void {
    if (!payload.user_id) throw new Error('user_id is required');
    if (!payload.user_role) throw new Error('user_role is required');
    if (!payload.user_name) throw new Error('user_name is required');
    if (!payload.comment) throw new Error('comment is required');
    if (!payload.reciver_id) throw new Error('reciver_id is required');
    if (!payload.reciver_role) throw new Error('reciver_role is required');
    if (!payload.reciver_name) throw new Error('reciver_name is required');
    if (!payload.claim_number) throw new Error('claim_number is required');
    if (!payload.claim_status) throw new Error('claim_status is required');
    if (!payload.claim_id) throw new Error('claim_id is required');
  }

  // Helper method to create FormData
  private createFormData(payload: CreateCommentPayload): FormData {
    const formData = new FormData();

    formData.append('user_id', payload.user_id.toString());
    formData.append('user_role', payload.user_role);
    formData.append('user_name', payload.user_name);
    formData.append('comment', payload.comment);
    formData.append('reciver_id', payload.reciver_id.toString());
    formData.append('reciver_role', payload.reciver_role);
    formData.append('reciver_name', payload.reciver_name);
    formData.append('claim_number', payload.claim_number);
    formData.append('claim_status', payload.claim_status);
    formData.append('claim_id', payload.claim_id.toString());

    if (payload.comment_file) {
      formData.append('comment_file', payload.comment_file);
    }

    return formData;
  }
}
