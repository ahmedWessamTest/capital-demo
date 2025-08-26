import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/conf/api.config';
import { AuthService } from '@core/services/auth/auth.service';

export interface UserProfileData {
  id: number;
  apple_id: string | null;
  google_id: string | null;
  name: string;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  email: string;
  email_verified_at: string | null;
  role: string;
  admin_status: number;
  active_status: number;
  active_code: string | null;
  forget_code: string | null;
  deactive_status: number;
  delete_status: number;
  device_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDataResponse {
  user: UserProfileData;
}

export interface UpdateProfilePayload {
  name?: string;
  gender?: string;
  birth_date?: string;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface UpdatePasswordResponse {
  row: UserProfileData;
  success: string;
}

export interface DeactivateUserPayload {
  deactive_status: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _http = inject(HttpClient);
  private _authService = inject(AuthService);
  private baseUrl = API_CONFIG.BASE_URL;

  getUserData(): Observable<UserDataResponse> {
    const userId = this._authService.getUserId();
    if (!userId) {
      console.error('User ID not found. Cannot fetch profile data.');
      throw new Error('User ID not found');
    }
    return this._http.get<UserDataResponse>(`${this.baseUrl}app-profile/userdata/${userId}`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<any> {
    const userId = this._authService.getUserId();
    if (!userId) {
      console.error('User ID not found. Cannot update profile.');
      throw new Error('User ID not found');
    }
    const formData = new FormData();
    if (payload.name) {
      formData.append('name', payload.name);
    }
    if (payload.gender) {
      formData.append('gender', payload.gender);
    }
    return this._http.post<any>(`${this.baseUrl}app-profile/updateprofile/${userId}`, formData);
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<UpdatePasswordResponse> {
    const userId = this._authService.getUserId();
    if (!userId) {
      console.error('User ID not found. Cannot update password.');
      throw new Error('User ID not found');
    }
    const formData = new FormData();
    formData.append('password', payload.password);
    return this._http.post<UpdatePasswordResponse>(`${this.baseUrl}app-profile/updatepassword/${userId}`, formData);
  }

  deactivateUser(payload: DeactivateUserPayload): Observable<any> {
    const userId = this._authService.getUserId();
    if (!userId) {
      console.error('User ID not found. Cannot deactivate user.');
      throw new Error('User ID not found');
    }
    const formData = new FormData();
    formData.append('deactive_status', payload.deactive_status.toString());
    return this._http.post<any>(`${this.baseUrl}app-profile/deactiveuser/${userId}`, formData);
  }

  deleteUser(): Observable<any> {
    const userId = this._authService.getUserId();
    if (!userId) {
      console.error('User ID not found. Cannot delete user.');
      throw new Error('User ID not found');
    }
    return this._http.post<any>(`${this.baseUrl}app-profile/deleteuser/${userId}`,{});
  }
}