import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { AuthStorageService, UserData } from './auth-storage.service';
import { LanguageService } from '../language.service';
import { API_CONFIG } from '../../conf/api.config';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { toFormData } from '@core/utils/form-utils';

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  name: string;
  email: string;
  phone: string;
}

interface AuthResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  user?: any;
  [key: string]: any;
}

// Interfaces for specific API responses if they differ
interface ForgotPasswordResponse {
  success?: string; // Backend might send 'success' or 'error' message
  error?: string;
  message?: string; // General message
}

interface VerifyOtpResponse {
  error?: string; // e.g., 'Correct OTP.', 'Invalid OTP.'
  message?: string; // General message
}

interface ResetPasswordResponse {
  success?: string;
  error?: string;
  message?: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _http = inject(HttpClient);
  private  auth:Auth = inject(Auth);
  private baseUrl = API_CONFIG.BASE_URL;
  private authStorage = inject(AuthStorageService);
  private _router = inject(Router);
  private _languageService = inject(LanguageService);
  private platformId = inject(PLATFORM_ID); // Inject PLATFORM_ID

  private resetEmail: string = '';
  private resetOtp: string = '';
  private readonly OTP_VERIFIED_TIMESTAMP_KEY = 'otpVerifiedTimestamp'; // Key for the timestamp

  // Helper to check if running in browser
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Authentication state using signal
  private isAuthenticatedValue = signal<boolean>(this.checkAuthStatus());
   signInWithGoogle(): Observable<any> {
  if (!this.isBrowser) {
    // ✅ امنع التنفيذ على الـ server
    return of({ error: 'Google sign-in is only available in the browser.' });
  }

  const provider = new GoogleAuthProvider();
  return from(signInWithPopup(this.auth, provider)).pipe(
  switchMap(result => {
    const user = result.user;
    const providerData = user.providerData[0];
    const sendData = new FormData();
    sendData.append('google_id', user.uid || '');
    sendData.append('email', providerData?.email || '');

    return this._http.post<any>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN_GOOGLE}`,
      sendData
    ).pipe(
      tap(response => {
        if (response.access_token) {
          const expiresIn = response.expires_in || 24 * 60 * 60;
          this.authStorage.saveToken(response.access_token, expiresIn);

          if (response.user) {
            this.authStorage.saveUserData(response.user);
          }

          this.isAuthenticatedValue.set(true);
        }
      })
    );
  }),
  catchError(err => {
    console.error('Google Sign-In error:', err);
    return of({ error: 'Failed to sign in with Google' });
  })
);

}

  login(data: ILogin): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    return this._http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.LOGIN}`, formData)
      .pipe(
        tap((response) => {
          if (response.access_token) {
            // Default expiration to 24 hours if not provided by backend
            const expiresIn = response.expires_in || 24 * 60 * 60;
            this.authStorage.saveToken(response.access_token, expiresIn);

            // Save user data to local storage
            if (response.user) {
              this.authStorage.saveUserData(response.user);
            }

            this.isAuthenticatedValue.set(true);
          }
        })
      );
  }
  setPassword(data: ILogin): Observable<AuthResponse> {
    const formData = new FormData();
    
    formData.append('user_id', this.getUserData()?.id.toString() || '');
    formData.append('password', data.password);
    return this._http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.SET_PASS}`, formData);
  }
  

  // register(data: IRegister): Observable<AuthResponse> { // Changed return type to AuthResponse for consistency
  //   const formData = new FormData();
  //   formData.append('name', data.name);
  //   formData.append('email', data.email);
  //   formData.append('phone', data.phone);

  //   return this._http
  //     .post<AuthResponse>(
  //       `${this.baseUrl}${API_CONFIG.AUTH.REGISTER}`,
  //       formData
  //     )
  //     .pipe(
  //       tap((response: AuthResponse) => {
  //         if (response && response.access_token) {
  //           this.authStorage.saveToken(
  //             response.access_token,
  //             response.expires_in || 24 * 60 * 60
  //           );

  //           // Save user data to local storage
  //           if (response.user) {
  //             this.authStorage.saveUserData(response.user);
  //           }

  //           this.isAuthenticatedValue.set(true);
  //         }
  //       })
  //     );
  // }
  register(data: IRegister): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('password', 'defaultPassword123'); // Add password to match HomeFormComponent
  
    return this._http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.REGISTER}`, formData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.user) {
            // Save user data to AuthStorageService
            this.authStorage.saveUserData(response.user);
            // Save token if provided (assuming registration may return a token)
            if (response.access_token) {
              this.authStorage.saveToken(
                response.access_token,
                response.expires_in || 24 * 60 * 60
              );
              this.isAuthenticatedValue.set(true);
            } else {
              // If no token is returned, ensure isAuthenticated is false
              this.isAuthenticatedValue.set(false);
            }
          }
        })
      );
  }
  logout(): Observable<any> {
    this.authStorage.logout();
    this.isAuthenticatedValue.set(false);

    // Clear any reset password specific data on logout
    this.clearResetEmail();
    this.clearResetOtp();
    this.clearOtpVerificationTime(); // Clear OTP timestamp on logout

    let lang = '';
    this._languageService.currentLanguage$.subscribe((next) => (lang = next));
    this._router.navigate(['/', lang]);
    this.logoutFromGoogle();
    return of({ success: true });
  }
  logoutFromGoogle(): Observable<void> {
    if(this.isBrowser) {
      return from(signOut(this.auth));
    }
    return EMPTY
  }
  get CurrentGoogleUser():User | null {
    return this.auth.currentUser;
  }
  isAuthenticated(): boolean {
    return this.isAuthenticatedValue();
  }

  getToken(): string | null {
    return this.authStorage.getToken();
  }

  authenticationState() {
    return this.isAuthenticatedValue.asReadonly();
  }

  private checkAuthStatus(): boolean {
    return !!this.authStorage.getToken();
  }

  getUserData(): UserData | null {
    return this.authStorage.getUserData();
  }

  getUserId(): string {
    return this.authStorage.getUserData()?.id.toString() || '';
  }

  // --- Password Reset Flow Methods ---

  sendOTp(email: string): Observable<ForgotPasswordResponse> { // Explicitly type response
    const formData = new FormData();
    formData.append('email', email);

    return this._http.post<ForgotPasswordResponse>(`${this.baseUrl}${API_CONFIG.AUTH.FORGET_PASSWORD}`, formData);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<VerifyOtpResponse> { // Explicitly type response
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('reset_code', data.otp);

    return this._http.post<VerifyOtpResponse>(`${this.baseUrl}${API_CONFIG.AUTH.RESET_PASSWORD}`, formData)
      .pipe(
        tap((response) => {
          // Assuming your backend sends a specific string like 'Correct OTP.' on success
          // You might need to adjust this condition based on your actual backend response
          if (response.error === 'Correct OTP.') { // Or response.success for success messages
            this.storeOtpVerificationTime(); // Store timestamp on successful OTP verification
          }
        })
      );
  }

  resetPassword(data: any): Observable<ResetPasswordResponse> { // Explicitly type response
    const formData = new FormData();
    // Get email from where it's correctly stored for the reset process (your service property)
    const emailToUse = this.getResetEmail();
    if (!emailToUse) {
      // Handle scenario where email isn't set, though it should be by forgot-password component
      console.error('Reset password email is not set in AuthService.');
      // You might want to return an Observable.throw or Observable.of with an error here
      return of({ error: 'Reset email not found', message: 'Please start the password reset process again.' });
    }

    formData.append('email', emailToUse); // Use the stored email
    formData.append('password', data.password);
    formData.append('password_confirmation', data.password_confirmation);
    formData.append('reset_code', data.otp || this.getResetOtp()); // Use stored OTP if not provided in data

    return this._http.post<ResetPasswordResponse>(`${this.baseUrl}${API_CONFIG.AUTH.RESET_PASSWORD}`, formData)
      .pipe(
        tap(() => {
          // Clear all reset-related data after successful password reset
          this.clearResetEmail();
          this.clearResetOtp();
          this.clearOtpVerificationTime(); // Clear OTP timestamp after successful password reset
        })
      );
  }

  // --- Helper Methods for Password Reset State (In-Memory for resetEmail/resetOtp, LocalStorage for Timestamp) ---

  storeResetEmail(email: string): void {
    this.resetEmail = email; // Stored in-memory, as per your original code
  }

  getResetEmail(): string {
    return this.resetEmail; // Retrieves from in-memory
  }

  clearResetEmail(): void {
    this.resetEmail = ''; // Clears in-memory
  }

  storeResetOtp(otp: string): void {
    this.resetOtp = otp; // Stored in-memory, as per your original code
  }

  getResetOtp(): string {
    return this.resetOtp; // Retrieves from in-memory
  }

  clearResetOtp(): void {
    this.resetOtp = ''; // Clears in-memory
  }

  // --- OTP Verification Time Management (for the Guard) ---

  storeOtpVerificationTime(): void {
    if (this.isBrowser) { // Ensure running in browser before localStorage operation
      localStorage.setItem(this.OTP_VERIFIED_TIMESTAMP_KEY, Date.now().toString());
    }
  }

  getOtpVerifiedTime(): number | null {
    if (this.isBrowser) { // Ensure running in browser before localStorage operation
      const storedTime = localStorage.getItem(this.OTP_VERIFIED_TIMESTAMP_KEY);
      return storedTime ? parseInt(storedTime, 10) : null;
    }
    return null; // Return null if not in browser
  }

  clearOtpVerificationTime(): void {
    if (this.isBrowser) { // Ensure running in browser before localStorage operation
      localStorage.removeItem(this.OTP_VERIFIED_TIMESTAMP_KEY);
    }
  }

  // Helper to get current language for redirects
  getCurrentLang(): string {
    return this._languageService.getCurrentLanguage();
  }

  updateUserData(data:any):Observable<any> {
    return this._http.post<any>(`${this.baseUrl}${API_CONFIG.AUTH.UPDATE_USER_DATA}`,data).pipe(
      tap(response => {
        console.log(response);
      })
    );
  } 
}