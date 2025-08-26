// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { Observable, BehaviorSubject, map, shareReplay } from 'rxjs';
// import { API_CONFIG } from '@core/conf/api.config';
// import { EnglishBlog } from '../blogs/english-blogs.service';

// // Interfaces (unchanged, included for completeness)
// export interface MedicalPolicy {
//   id: number;
//   user_id: number;
//   category_id: number;
//   medical_insurance_id: number;
//   payment_method: string;
//   medical_insurance_number: string;
//   admin_medical_insurance_number: string;
//   name: string;
//   email: string;
//   phone: string;
//   birthdate: string;
//   gender: string;
//   start_date: string;
//   duration: string;
//   end_date: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Feature {
//   id: number;
//   en_title: string;
//   ar_title: string;
//   en_description: string;
//   ar_description: string;
//   icon_image: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface FeaturesResponse {
//   success: boolean;
//   message: string;
//   data: Feature[];
// }

// export interface MotorPolicy {
//   id: number;
//   user_id: number;
//   category_id: number;
//   motor_insurance_id: number;
//   payment_method: string;
//   motor_insurance_number: string;
//   admin_motor_insurance_number: string;
//   name: string;
//   email: string;
//   phone: string;
//   birthdate: string;
//   gender: string;
//   car_type_id: number;
//   car_type: string;
//   car_brand_id: number;
//   car_brand: string;
//   car_model_id: number;
//   car_model: string;
//   car_year_id: number;
//   car_year: string;
//   car_price: string;
//   start_date: string;
//   duration: string;
//   end_date: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface BuildingPolicy {
//   id: number;
//   user_id: number;
//   category_id: number;
//   building_insurance_id: number;
//   payment_method: string;
//   building_insurance_number: string;
//   admin_building_insurance_number: string;
//   name: string;
//   email: string;
//   phone: string;
//   birthdate: string;
//   gender: string;
//   building_type_id: number;
//   building_type: string;
//   building_country_id: number;
//   building_country: string;
//   building_city: string;
//   building_price: string;
//   start_date: string;
//   duration: string;
//   end_date: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Category {
//   id: number;
//   en_title: string;
//   ar_title: string;
//   en_slug: string;
//   ar_slug: string;
//   en_small_description: string;
//   ar_small_description: string;
//   en_main_description: string;
//   ar_main_description: string;
//   network_link: string;
//   counter_number: number;
//   en_meta_title: string;
//   ar_meta_title: string;
//   en_meta_description: string;
//   ar_meta_description: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Counter {
//   id: number;
//   en_title: string;
//   ar_title: string;
//   en_description: string;
//   ar_description: string;
//   icon_image: string;
//   counter_value: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface ArabicBlog {
//   id: number;
//   ar_blog_title: string;
//   ar_slug: string;
//   ar_blog_text: string;
//   main_image: string;
//   blog_date: string;
//   ar_meta_title: string;
//   ar_meta_text: string;
//   ar_first_script_text: string;
//   ar_second_script_text: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Partner {
//   id: number;
//   category_id: number;
//   en_partner_name: string;
//   ar_partner_name: string;
//   partner_image: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Client {
//   id: number;
//   en_client_name: string;
//   ar_client_name: string;
//   client_image: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface HomeDataResponse {
//   medicalPolicy: MedicalPolicy[];
//   motorPolicy: MotorPolicy[];
//   buildingPolicy: BuildingPolicy[];
//   categories: Category[];
//   counters: Counter[];
//   ArabicBlog: ArabicBlog[];
//   EnglishBlog: EnglishBlog[];
//   partners: Partner[];
//   clients: Client[];
// }

// export interface AboutData {
//   id: number;
//   en_main_title: string;
//   ar_main_title: string;
//   en_main_content: string;
//   ar_main_content: string;
//   main_image: string;
//   en_mission: string;
//   ar_mission: string;
//   en_vision: string;
//   ar_vision: string;
//   en_values_title: string;
//   ar_values_title: string;
//   en_values_text: string;
//   ar_values_text: string;
//   en_history_title: string;
//   ar_history_title: string;
//   en_history_text: string;
//   ar_history_text: string;
//   history_image: string;
//   en_meta_title: string;
//   ar_meta_title: string;
//   en_meta_description: string;
//   ar_meta_description: string;
//   active_status: string;
//   created_at: string | null;
//   updated_at: string;
// }

// export interface AboutCounter {
//   id: number;
//   en_name: string;
//   ar_name: string;
//   counter_value: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface AboutDataResponse {
//   about: AboutData;
//   counters: AboutCounter[];
// }

// export interface Testimonial {
//   id: number;
//   en_name: string;
//   ar_name: string;
//   en_position: string;
//   ar_position: string;
//   en_text: string;
//   ar_text: string;
//   image: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface TestimonialsResponse {
//   success: boolean;
//   message: string;
//   data: Testimonial[];
// }

// export interface ContactData {
//   id: number;
//   en_address: string;
//   ar_address: string;
//   google_plus: string;
//   first_phone: string;
//   second_phone: string;
//   third_phone: string;
//   fourth_phone: string;
//   whatsapp: string;
//   email: string;
//   facebook: string;
//   twitter: string;
//   instagram: string;
//   linkedin: string;
//   youtube: string;
//   en_meta_title: string;
//   ar_meta_title: string;
//   en_meta_description: string;
//   ar_meta_description: string;
//   en_contact_title: string;
//   ar_contact_title: string;
//   en_contact_text: string;
//   ar_contact_text: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface ContactDataResponse {
//   contact: ContactData;
// }

// export interface ClaimInfo {
//   id: number;
//   en_main_title: string;
//   ar_main_title: string;
//   en_main_text: string;
//   ar_main_text: string;
//   en_meta_title: string;
//   ar_meta_title: string;
//   en_meta_text: string;
//   ar_meta_text: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface ClaimInfoResponse {
//   success: boolean;
//   message: string;
//   data: ClaimInfo;
// }

// export interface AboutDownload {
//   id: number;
//   en_title: string;
//   ar_title: string;
//   en_text: string;
//   ar_text: string;
//   android_download_link: string;
//   ios_download_link: string;
//   elwinsh_link: string;
//   active_status: string;
//   created_at: string | null;
//   updated_at: string;
// }

// export interface AboutDownloadResponse {
//   success: boolean;
//   message: string;
//   data: AboutDownload;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class GenericDataService {
//   private _http = inject(HttpClient);
//   private baseUrl = API_CONFIG.BASE_URL;

//   // BehaviorSubjects for storing the data
//   private homeDataSubject = new BehaviorSubject<HomeDataResponse | null>(null);
//   private aboutDataSubject = new BehaviorSubject<AboutDataResponse | null>(null);
//   private contactDataSubject = new BehaviorSubject<ContactDataResponse | null>(null);
//   private claimInfoSubject = new BehaviorSubject<ClaimInfo | null>(null);
//   private aboutDownloadSubject = new BehaviorSubject<AboutDownload | null>(null);
//   private featuresSubject = new BehaviorSubject<Feature[] | null>(null);
//   private testimonialsSubject = new BehaviorSubject<Testimonial[] | null>(null);

//   // Public observables
//   homeData$ = this.homeDataSubject.asObservable();
//   aboutData$ = this.aboutDataSubject.asObservable();
//   contactData$ = this.contactDataSubject.asObservable();
//   claimInfo$ = this.claimInfoSubject.asObservable();
//   aboutDownload$ = this.aboutDownloadSubject.asObservable();
//   features$ = this.featuresSubject.asObservable();
//   testimonials$ = this.testimonialsSubject.asObservable();

//   // Simple browser check
//   private isBrowser(): boolean {
//     return typeof window !== 'undefined';
//   }

//   // Fetch all data at once
//   // fetchAllData(): void {
//   //   if (!this.isBrowser()) return;

//   //   this.getHomeData().subscribe();
//   //   this.getAboutData().subscribe();
//   //   this.getContactData().subscribe();
//   //   this.getClaimInfo(1).subscribe();
//   //   this.getAboutDownload().subscribe();
//   //   this.getFeatures().subscribe();
//   //   this.getTestimonials().subscribe();
//   // }

//   // Home Data
//   getHomeData(): Observable<HomeDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<HomeDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<HomeDataResponse>(`${this.baseUrl}app-home/getHomeData`);
//     observable.subscribe(data => this.homeDataSubject.next(data));
//     return observable;
//   }

//   // About Data
//   getAboutData(): Observable<AboutDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<AboutDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<AboutDataResponse>(`${this.baseUrl}app-home/getAboutData`);
//     observable.subscribe(data => this.aboutDataSubject.next(data));
//     return observable;
//   }

//   // Contact Data
//   getContactData(): Observable<ContactDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<ContactDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<ContactDataResponse>(`${this.baseUrl}app-home/getContactData`);
//     observable.subscribe(data => this.contactDataSubject.next(data));
//     return observable;
//   }

//   // Claim Info
//   getClaimInfo(id: number): Observable<ClaimInfo> {
//     if (!this.isBrowser()) {
//       return new Observable<ClaimInfo>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
//       .pipe(map(response => response.data));
//     observable.subscribe(data => this.claimInfoSubject.next(data));
//     return observable;
//   }
//   getClaimInfoOnce(id: number): Observable<ClaimInfo> {
//     return this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
//       .pipe(map(response => response.data));
//   }

//   // About Download
//   getAboutDownload(): Observable<AboutDownload> {
//     if (!this.isBrowser()) {
//       return new Observable<AboutDownload>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<AboutDownloadResponse>(`${this.baseUrl}about-download`)
//       .pipe(map(response => response.data), shareReplay(1));
//     observable.subscribe(data => this.aboutDownloadSubject.next(data));
//     return observable;
//   }

//   // Features Data
//   getFeatures(): Observable<Feature[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Feature[]>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<FeaturesResponse>(`${this.baseUrl}features`)
//       .pipe(map(response => response.data));
//     observable.subscribe(data => this.featuresSubject.next(data));
//     return observable;
//   }

//   // Testimonials Data
//   getTestimonials(): Observable<Testimonial[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Testimonial[]>(observer => {
//         observer.complete();
//       });
//     }

//     const observable = this._http.get<TestimonialsResponse>(`${this.baseUrl}testimonials`)
//       .pipe(map(response => response.data));
//     observable.subscribe(data => this.testimonialsSubject.next(data));
//     return observable;
//   }

//   // Clear all data
//   clearAllData(): void {
//     this.homeDataSubject.next(null);
//     this.aboutDataSubject.next(null);
//     this.contactDataSubject.next(null);
//     this.claimInfoSubject.next(null);
//     this.aboutDownloadSubject.next(null);
//     this.featuresSubject.next(null);
//     this.testimonialsSubject.next(null);
//   }
// }


// // import { HttpClient } from '@angular/common/http';
// // import { inject, Injectable, signal } from '@angular/core';
// // import { Observable, BehaviorSubject, map, of, tap, shareReplay } from 'rxjs';
// // import { API_CONFIG } from '@core/conf/api.config';
// // import { EnglishBlog } from '../blogs/english-blogs.service';

// // // Interfaces (unchanged, included for completeness)
// // export interface MedicalPolicy {
// //   id: number;
// //   user_id: number;
// //   category_id: number;
// //   medical_insurance_id: number;
// //   payment_method: string;
// //   medical_insurance_number: string;
// //   admin_medical_insurance_number: string;
// //   name: string;
// //   email: string;
// //   phone: string;
// //   birthdate: string;
// //   gender: string;
// //   start_date: string;
// //   duration: string;
// //   end_date: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface Feature {
// //   id: number;
// //   en_title: string;
// //   ar_title: string;
// //   en_description: string;
// //   ar_description: string;
// //   icon_image: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface FeaturesResponse {
// //   success: boolean;
// //   message: string;
// //   data: Feature[];
// // }

// // export interface MotorPolicy {
// //   id: number;
// //   user_id: number;
// //   category_id: number;
// //   motor_insurance_id: number;
// //   payment_method: string;
// //   motor_insurance_number: string;
// //   admin_motor_insurance_number: string;
// //   name: string;
// //   email: string;
// //   phone: string;
// //   birthdate: string;
// //   gender: string;
// //   car_type_id: number;
// //   car_type: string;
// //   car_brand_id: number;
// //   car_brand: string;
// //   car_model_id: number;
// //   car_model: string;
// //   car_year_id: number;
// //   car_year: string;
// //   car_price: string;
// //   start_date: string;
// //   duration: string;
// //   end_date: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface BuildingPolicy {
// //   id: number;
// //   user_id: number;
// //   category_id: number;
// //   building_insurance_id: number;
// //   payment_method: string;
// //   building_insurance_number: string;
// //   admin_building_insurance_number: string;
// //   name: string;
// //   email: string;
// //   phone: string;
// //   birthdate: string;
// //   gender: string;
// //   building_type_id: number;
// //   building_type: string;
// //   building_country_id: number;
// //   building_country: string;
// //   building_city: string;
// //   building_price: string;
// //   start_date: string;
// //   duration: string;
// //   end_date: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface Category {
// //   id: number;
// //   en_title: string;
// //   ar_title: string;
// //   en_slug: string;
// //   ar_slug: string;
// //   en_small_description: string;
// //   ar_small_description: string;
// //   en_main_description: string;
// //   ar_main_description: string;
// //   network_link: string;
// //   counter_number: number;
// //   en_meta_title: string;
// //   ar_meta_title: string;
// //   en_meta_description: string;
// //   ar_meta_description: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface Counter {
// //   id: number;
// //   en_title: string;
// //   ar_title: string;
// //   en_description: string;
// //   ar_description: string;
// //   icon_image: string;
// //   counter_value: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface ArabicBlog {
// //   id: number;
// //   ar_blog_title: string;
// //   ar_slug: string;
// //   ar_blog_text: string;
// //   main_image: string;
// //   blog_date: string;
// //   ar_meta_title: string;
// //   ar_meta_text: string;
// //   ar_first_script_text: string;
// //   ar_second_script_text: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface Partner {
// //   id: number;
// //   category_id: number;
// //   en_partner_name: string;
// //   ar_partner_name: string;
// //   partner_image: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface Client {
// //   id: number;
// //   en_client_name: string;
// //   ar_client_name: string;
// //   client_image: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface HomeDataResponse {
// //   medicalPolicy: MedicalPolicy[];
// //   motorPolicy: MotorPolicy[];
// //   buildingPolicy: BuildingPolicy[];
// //   categories: Category[];
// //   counters: Counter[];
// //   ArabicBlog: ArabicBlog[];
// //   EnglishBlog: EnglishBlog[];
// //   partners: Partner[];
// //   clients: Client[];
// // }

// // export interface AboutData {
// //   id: number;
// //   en_main_title: string;
// //   ar_main_title: string;
// //   en_main_content: string;
// //   ar_main_content: string;
// //   main_image: string;
// //   en_mission: string;
// //   ar_mission: string;
// //   en_vision: string;
// //   ar_vision: string;
// //   en_values_title: string;
// //   ar_values_title: string;
// //   en_values_text: string;
// //   ar_values_text: string;
// //   en_history_title: string;
// //   ar_history_title: string;
// //   en_history_text: string;
// //   ar_history_text: string;
// //   history_image: string;
// //   en_meta_title: string;
// //   ar_meta_title: string;
// //   en_meta_description: string;
// //   ar_meta_description: string;
// //   active_status: string;
// //   created_at: string | null;
// //   updated_at: string;
// // }

// // export interface AboutCounter {
// //   id: number;
// //   en_name: string;
// //   ar_name: string;
// //   counter_value: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface AboutDataResponse {
// //   about: AboutData;
// //   counters: AboutCounter[];
// // }

// // export interface Testimonial {
// //   id: number;
// //   en_name: string;
// //   ar_name: string;
// //   en_position: string;
// //   ar_position: string;
// //   en_text: string;
// //   ar_text: string;
// //   image: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface TestimonialsResponse {
// //   success: boolean;
// //   message: string;
// //   data: Testimonial[];
// // }

// // export interface ContactData {
// //   id: number;
// //   en_address: string;
// //   ar_address: string;
// //   google_plus: string;
// //   first_phone: string;
// //   second_phone: string;
// //   third_phone: string;
// //   fourth_phone: string;
// //   whatsapp: string;
// //   email: string;
// //   facebook: string;
// //   twitter: string;
// //   instagram: string;
// //   linkedin: string;
// //   youtube: string;
// //   en_meta_title: string;
// //   ar_meta_title: string;
// //   en_meta_description: string;
// //   ar_meta_description: string;
// //   en_contact_title: string;
// //   ar_contact_title: string;
// //   en_contact_text: string;
// //   ar_contact_text: string;
// //   active_status: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface ContactDataResponse {
// //   contact: ContactData;
// // }

// // export interface ClaimInfo {
// //   id: number;
// //   en_main_title: string;
// //   ar_main_title: string;
// //   en_main_text: string;
// //   ar_main_text: string;
// //   en_meta_title: string;
// //   ar_meta_title: string;
// //   en_meta_text: string;
// //   ar_meta_text: string;
// //   created_at: string;
// //   updated_at: string;
// // }

// // export interface ClaimInfoResponse {
// //   success: boolean;
// //   message: string;
// //   data: ClaimInfo;
// // }

// // export interface AboutDownload {
// //   id: number;
// //   en_title: string;
// //   ar_title: string;
// //   en_text: string;
// //   ar_text: string;
// //   android_download_link: string;
// //   ios_download_link: string;
// //   elwinsh_link: string;
// //   active_status: string;
// //   created_at: string | null;
// //   updated_at: string;
// // }

// // export interface AboutDownloadResponse {
// //   success: boolean;
// //   message: string;
// //   data: AboutDownload;
// // }

// // // Cache key type for type safety
// // type CacheKey = 'homeData' | 'aboutData' | 'contactData' | 'claimInfo' | 'aboutDownload' | 'features' | 'testimonials';

// // @Injectable({
// //   providedIn: 'root',
// // })
// // export class GenericDataService {
// //   private _http = inject(HttpClient);
// //   private baseUrl = API_CONFIG.BASE_URL;

// //   // Cache expiration time in milliseconds (default: 5 minutes)
// //   private readonly CACHE_EXPIRATION = 5 * 60 * 1000;

// //   // Cache signals
// //   private homeDataCache = signal<HomeDataResponse | null>(null);
// //   private aboutDataCache = signal<AboutDataResponse | null>(null);
// //   private contactDataCache = signal<ContactDataResponse | null>(null);
// //   private claimInfoCache = signal<ClaimInfo | null>(null);
// //   private aboutDownloadCache = signal<AboutDownload | null>(null);
// //   private featuresCache = signal<Feature[] | null>(null);
// //   private testimonialsCache = signal<Testimonial[] | null>(null);

// //   // Cache timestamps to handle invalidation
// //   private cacheTimestamps = signal<Record<string, number>>({
// //     homeData: 0,
// //     aboutData: 0,
// //     contactData: 0,
// //     claimInfo: 0,
// //     aboutDownload: 0,
// //     features: 0,
// //     testimonials: 0,
// //   });

// //   // BehaviorSubjects for storing the data (kept for backward compatibility)
// //   private homeDataSubject = new BehaviorSubject<HomeDataResponse | null>(null);
// //   private aboutDataSubject = new BehaviorSubject<AboutDataResponse | null>(null);
// //   private contactDataSubject = new BehaviorSubject<ContactDataResponse | null>(null);
// //   private claimInfoSubject = new BehaviorSubject<ClaimInfo | null>(null);
// //   private aboutDownloadSubject = new BehaviorSubject<AboutDownload | null>(null);
// //   private featuresSubject = new BehaviorSubject<Feature[] | null>(null);
// //   private testimonialsSubject = new BehaviorSubject<Testimonial[] | null>(null);

// //   // Public observables
// //   homeData$ = this.homeDataSubject.asObservable();
// //   aboutData$ = this.aboutDataSubject.asObservable();
// //   contactData$ = this.contactDataSubject.asObservable();
// //   claimInfo$ = this.claimInfoSubject.asObservable();
// //   aboutDownload$ = this.aboutDownloadSubject.asObservable();
// //   features$ = this.featuresSubject.asObservable();
// //   testimonials$ = this.testimonialsSubject.asObservable();

// //   // Signal getters for components that want to subscribe directly
// //   get homeData() {
// //     return this.homeDataCache;
// //   }

// //   get aboutData() {
// //     return this.aboutDataCache;
// //   }

// //   get contactData() {
// //     return this.contactDataCache;
// //   }

// //   get claimInfo() {
// //     return this.claimInfoCache;
// //   }

// //   get aboutDownload() {
// //     return this.aboutDownloadCache;
// //   }

// //   get features() {
// //     return this.featuresCache;
// //   }

// //   get testimonials() {
// //     return this.testimonialsCache;
// //   }

// //   // Simple browser check
// //   private isBrowser(): boolean {
// //     return typeof window !== 'undefined';
// //   }

// //   // Fetch all data at once
// //   fetchAllData(): void {
// //     if (!this.isBrowser()) return;

// //     this.getHomeData().subscribe();
// //     this.getAboutData().subscribe();
// //     this.getContactData().subscribe();
// //     this.getClaimInfo(1).subscribe();
// //     this.getAboutDownload().subscribe();
// //     this.getFeatures().subscribe();
// //     this.getTestimonials().subscribe();
// //   }

// //   // Home Data
// //   getHomeData(): Observable<HomeDataResponse> {
// //     if (!this.isBrowser()) {
// //       return new Observable<HomeDataResponse>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('homeData') && this.homeDataCache()) {
// //       const cachedData = this.homeDataCache()!;
// //       this.homeDataSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<HomeDataResponse>(`${this.baseUrl}app-home/getHomeData`).pipe(
// //       tap(data => {
// //         this.homeDataCache.set(data);
// //         this.updateCacheTimestamp('homeData');
// //         this.homeDataSubject.next(data);
// //       }),
// //       shareReplay(1)
// //     );

// //     return observable;
// //   }

// //   // About Data
// //   getAboutData(): Observable<AboutDataResponse> {
// //     if (!this.isBrowser()) {
// //       return new Observable<AboutDataResponse>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('aboutData') && this.aboutDataCache()) {
// //       const cachedData = this.aboutDataCache()!;
// //       this.aboutDataSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<AboutDataResponse>(`${this.baseUrl}app-home/getAboutData`).pipe(
// //       tap(data => {
// //         this.aboutDataCache.set(data);
// //         this.updateCacheTimestamp('aboutData');
// //         this.aboutDataSubject.next(data);
// //       }),
// //       shareReplay(1)
// //     );

// //     return observable;
// //   }

// //   // Contact Data
// //   getContactData(): Observable<ContactDataResponse> {
// //     if (!this.isBrowser()) {
// //       return new Observable<ContactDataResponse>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('contactData') && this.contactDataCache()) {
// //       const cachedData = this.contactDataCache()!;
// //       this.contactDataSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<ContactDataResponse>(`${this.baseUrl}app-home/getContactData`).pipe(
// //       tap(data => {
// //         this.contactDataCache.set(data);
// //         this.updateCacheTimestamp('contactData');
// //         this.contactDataSubject.next(data);
// //       }),
// //       shareReplay(1)
// //     );

// //     return observable;
// //   }

// //   // Claim Info
// //   getClaimInfo(id: number): Observable<ClaimInfo> {
// //     if (!this.isBrowser()) {
// //       return new Observable<ClaimInfo>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('claimInfo') && this.claimInfoCache()) {
// //       const cachedData = this.claimInfoCache()!;
// //       this.claimInfoSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
// //       .pipe(
// //         map(response => response.data),
// //         tap(data => {
// //           this.claimInfoCache.set(data);
// //           this.updateCacheTimestamp('claimInfo');
// //           this.claimInfoSubject.next(data);
// //         }),
// //         shareReplay(1)
// //       );

// //     return observable;
// //   }

// //   getClaimInfoOnce(id: number): Observable<ClaimInfo> {
// //     return this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
// //       .pipe(map(response => response.data));
// //   }

// //   // About Download
// //   getAboutDownload(): Observable<AboutDownload> {
// //     if (!this.isBrowser()) {
// //       return new Observable<AboutDownload>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('aboutDownload') && this.aboutDownloadCache()) {
// //       const cachedData = this.aboutDownloadCache()!;
// //       this.aboutDownloadSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<AboutDownloadResponse>(`${this.baseUrl}about-download`)
// //       .pipe(
// //         map(response => response.data),
// //         tap(data => {
// //           this.aboutDownloadCache.set(data);
// //           this.updateCacheTimestamp('aboutDownload');
// //           this.aboutDownloadSubject.next(data);
// //         }),
// //         shareReplay(1)
// //       );

// //     return observable;
// //   }

// //   // Features Data
// //   getFeatures(): Observable<Feature[]> {
// //     if (!this.isBrowser()) {
// //       return new Observable<Feature[]>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('features') && this.featuresCache()) {
// //       const cachedData = this.featuresCache()!;
// //       this.featuresSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<FeaturesResponse>(`${this.baseUrl}features`)
// //       .pipe(
// //         map(response => response.data),
// //         tap(data => {
// //           this.featuresCache.set(data);
// //           this.updateCacheTimestamp('features');
// //           this.featuresSubject.next(data);
// //         }),
// //         shareReplay(1)
// //       );

// //     return observable;
// //   }

// //   // Testimonials Data
// //   getTestimonials(): Observable<Testimonial[]> {
// //     if (!this.isBrowser()) {
// //       return new Observable<Testimonial[]>(observer => {
// //         observer.complete();
// //       });
// //     }

// //     // Check if cache is valid
// //     if (this.isCacheValid('testimonials') && this.testimonialsCache()) {
// //       const cachedData = this.testimonialsCache()!;
// //       this.testimonialsSubject.next(cachedData);
// //       return of(cachedData);
// //     }

// //     const observable = this._http.get<TestimonialsResponse>(`${this.baseUrl}testimonials`)
// //       .pipe(
// //         map(response => response.data),
// //         tap(data => {
// //           this.testimonialsCache.set(data);
// //           this.updateCacheTimestamp('testimonials');
// //           this.testimonialsSubject.next(data);
// //         }),
// //         shareReplay(1)
// //       );

// //     return observable;
// //   }

// //   // Method to invalidate cache manually
// //   invalidateCache(cacheKey: CacheKey): void {
// //     switch (cacheKey) {
// //       case 'homeData':
// //         this.homeDataCache.set(null);
// //         this.homeDataSubject.next(null);
// //         break;
// //       case 'aboutData':
// //         this.aboutDataCache.set(null);
// //         this.aboutDataSubject.next(null);
// //         break;
// //       case 'contactData':
// //         this.contactDataCache.set(null);
// //         this.contactDataSubject.next(null);
// //         break;
// //       case 'claimInfo':
// //         this.claimInfoCache.set(null);
// //         this.claimInfoSubject.next(null);
// //         break;
// //       case 'aboutDownload':
// //         this.aboutDownloadCache.set(null);
// //         this.aboutDownloadSubject.next(null);
// //         break;
// //       case 'features':
// //         this.featuresCache.set(null);
// //         this.featuresSubject.next(null);
// //         break;
// //       case 'testimonials':
// //         this.testimonialsCache.set(null);
// //         this.testimonialsSubject.next(null);
// //         break;
// //     }
// //     this.updateCacheTimestamp(cacheKey, 0);
// //   }

// //   // Set custom expiration time for specific cache
// //   setCacheExpiration(key: CacheKey, expirationMs: number): void {
// //     const now = Date.now();
// //     const expiration = now + expirationMs;
// //     this.updateCacheTimestamp(key, expiration);
// //   }

// //   // Clear all data
// //   clearAllData(): void {
// //     this.homeDataCache.set(null);
// //     this.aboutDataCache.set(null);
// //     this.contactDataCache.set(null);
// //     this.claimInfoCache.set(null);
// //     this.aboutDownloadCache.set(null);
// //     this.featuresCache.set(null);
// //     this.testimonialsCache.set(null);

// //     this.homeDataSubject.next(null);
// //     this.aboutDataSubject.next(null);
// //     this.contactDataSubject.next(null);
// //     this.claimInfoSubject.next(null);
// //     this.aboutDownloadSubject.next(null);
// //     this.featuresSubject.next(null);
// //     this.testimonialsSubject.next(null);

// //     // Reset timestamps
// //     this.cacheTimestamps.set({
// //       homeData: 0,
// //       aboutData: 0,
// //       contactData: 0,
// //       claimInfo: 0,
// //       aboutDownload: 0,
// //       features: 0,
// //       testimonials: 0,
// //     });
// //   }

// //   // Check if cache is still valid
// //   private isCacheValid(key: string): boolean {
// //     const timestamp = this.cacheTimestamps()[key] || 0;
// //     const now = Date.now();
// //     // If timestamp is 0, it means cache was never set
// //     if (timestamp === 0) return false;
// //     return now - timestamp < this.CACHE_EXPIRATION;
// //   }

// //   // Helper to update timestamp
// //   private updateCacheTimestamp(key: string, time = Date.now()): void {
// //     this.cacheTimestamps.update((timestamps) => ({
// //       ...timestamps,
// //       [key]: time,
// //     }));
// //   }
// // }