// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable, signal } from '@angular/core';
// import { Observable, BehaviorSubject, map, of, tap, shareReplay } from 'rxjs';
// import { API_CONFIG } from '@core/conf/api.config';
// import { EnglishBlog } from './blogs/english-blogs.service';

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

// export interface Slider {
//   id: number;
//   en_title: string;
//   ar_title: string;
//   en_description: string;
//   ar_description: string;
//   image: string;
//   active_status: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface SliderResponse {
//   success: boolean;
//   message: string;
//   data: Slider[];
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
//   en_name: string;
//   ar_name: string;
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
//   slider: Slider[];
//   features: Feature[];
// }

// export interface AboutData {
//   id: number;
//   en_main_title: string;
//   ar_main_title: string;
//   en_main_content: string;
//   ar_main_content: string;
//   main_image: string;
//   en_mission: string;
//   en_about_first_feature_title: string;
// ar_about_first_feature_title: string;
// en_about_second_feature_title: string;
// ar_about_second_feature_title: string;
// en_about_first_feature_text: string;
// ar_about_first_feature_text: string;
// years_of_experience: string;
// en_about_second_feature_text: string;
// ar_about_second_feature_text: string;
//   ar_mission: string;
//   en_vision: string;
//   ar_vision: string;
//   en_values_title: string;
// ar_values_title: string;
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

// export interface FeaturesResponse {
//   success: boolean;
//   message: string;
//   features: Feature[];
// }

// type CacheKey = 'homeData' | 'aboutData' | 'contactData' | 'claimInfo' | 'aboutDownload' | 'sliders' | 'testimonials' | 'categories' | 'features' |'counters';

// @Injectable({
//   providedIn: 'root',
// })
// export class UpdatedGenericDataService {
//   private _http = inject(HttpClient);
//   private baseUrl = API_CONFIG.BASE_URL;

//   private readonly CACHE_EXPIRATION = 5 * 60 * 1000;

//   private homeDataCache = signal<HomeDataResponse | null>(null);
//   private aboutDataCache = signal<AboutDataResponse | null>(null);
//   private contactDataCache = signal<ContactDataResponse | null>(null);
//   private claimInfoCache = signal<ClaimInfo | null>(null);
//   private aboutDownloadCache = signal<AboutDownload | null>(null);
//   private slidersCache = signal<Slider[] | null>(null);
//   private testimonialsCache = signal<Testimonial[] | null>(null);
//   private categoriesCache = signal<Category[] | null>(null);
//   private featuresCache = signal<Feature[] | null>(null);
//   private countersCache = signal<Counter[] | null>(null);

//   private cacheTimestamps = signal<Record<string, number>>({
//     homeData: 0,
//     aboutData: 0,
//     contactData: 0,
//     claimInfo: 0,
//     aboutDownload: 0,
//     sliders: 0,
//     testimonials: 0,
//     categories: 0,
//     features: 0,
//     counters: 0,
//   });

//   private homeDataSubject = new BehaviorSubject<HomeDataResponse | null>(null);
//   private aboutDataSubject = new BehaviorSubject<AboutDataResponse | null>(null);
//   private contactDataSubject = new BehaviorSubject<ContactDataResponse | null>(null);
//   private claimInfoSubject = new BehaviorSubject<ClaimInfo | null>(null);
//   private aboutDownloadSubject = new BehaviorSubject<AboutDownload | null>(null);
//   private slidersSubject = new BehaviorSubject<Slider[] | null>(null);
//   private testimonialsSubject = new BehaviorSubject<Testimonial[] | null>(null);
//   private categoriesSubject = new BehaviorSubject<Category[] | null>(null);
//   private featuresSubject = new BehaviorSubject<Feature[] | null>(null);
//   private countersSubject = new BehaviorSubject<Counter[] | null>(null);

//   homeData$ = this.homeDataSubject.asObservable();
//   aboutData$ = this.aboutDataSubject.asObservable();
//   contactData$ = this.contactDataSubject.asObservable();
//   claimInfo$ = this.claimInfoSubject.asObservable();
//   aboutDownload$ = this.aboutDownloadSubject.asObservable();
//   sliders$ = this.slidersSubject.asObservable();
//   testimonials$ = this.testimonialsSubject.asObservable();
//   categories$ = this.categoriesSubject.asObservable();
//   features$ = this.featuresSubject.asObservable();
//   counters$ = this.countersSubject.asObservable();

//   get homeData() {
//     return this.homeDataCache;
//   }

//   get counters() {
//     return this.countersCache;
//   }

//   get aboutData() {
//     return this.aboutDataCache;
//   }

//   get contactData() {
//     return this.contactDataCache;
//   }

//   get claimInfo() {
//     return this.claimInfoCache;
//   }

//   get aboutDownload() {
//     return this.aboutDownloadCache;
//   }

//   get sliders() {
//     return this.slidersCache;
//   }

//   get testimonials() {
//     return this.testimonialsCache;
//   }

//   get categories() {
//     return this.categoriesCache;
//   }

//   get features() {
//     return this.featuresCache;
//   }

//   private isBrowser(): boolean {
//     return typeof window !== 'undefined';
//   }

//   fetchAllData(): void {
//     if (!this.isBrowser()) return;

//     this.getSliders().subscribe();
//     this.getCategories().subscribe();
//     this.getFeatures().subscribe();
//     this.getCounters().subscribe();
//   }

//   getHomeData(): Observable<HomeDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<HomeDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('homeData') && this.homeDataCache()) {
//       const cachedData = this.homeDataCache()!;
//       this.homeDataSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<HomeDataResponse>(`${this.baseUrl}app-home/getHomeData`).pipe(
//       tap(data => {
//         this.homeDataCache.set(data);
//         this.updateCacheTimestamp('homeData');
//         this.homeDataSubject.next(data);
//       }),
//       shareReplay(1)
//     );

//     return observable;
//   }
 

//   getAboutData(): Observable<AboutDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<AboutDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('aboutData') && this.aboutDataCache()) {
//       const cachedData = this.aboutDataCache()!;
//       this.aboutDataSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<AboutDataResponse>(`${this.baseUrl}app-home/getAboutData`).pipe(
//       tap(data => {
//         this.aboutDataCache.set(data);
//         this.updateCacheTimestamp('aboutData');
//         this.aboutDataSubject.next(data);
//       }),
//       shareReplay(1)
//     );

//     return observable;
//   }

//   getContactData(): Observable<ContactDataResponse> {
//     if (!this.isBrowser()) {
//       return new Observable<ContactDataResponse>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('contactData') && this.contactDataCache()) {
//       const cachedData = this.contactDataCache()!;
//       this.contactDataSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<ContactDataResponse>(`${this.baseUrl}app-home/getContactData`).pipe(
//       tap(data => {
//         this.contactDataCache.set(data);
//         this.updateCacheTimestamp('contactData');
//         this.contactDataSubject.next(data);
//       }),
//       shareReplay(1)
//     );

//     return observable;
//   }

//   getClaimInfo(id: number): Observable<ClaimInfo> {
//     if (!this.isBrowser()) {
//       return new Observable<ClaimInfo>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('claimInfo') && this.claimInfoCache()) {
//       const cachedData = this.claimInfoCache()!;
//       this.claimInfoSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
//       .pipe(
//         map(response => response.data),
//         tap(data => {
//           this.claimInfoCache.set(data);
//           this.updateCacheTimestamp('claimInfo');
//           this.claimInfoSubject.next(data);
//         }),
//         shareReplay(1)
//       );

//     return observable;
//   }

//   getClaimInfoOnce(id: number): Observable<ClaimInfo> {
//     return this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
//       .pipe(map(response => response.data));
//   }

//   getAboutDownload(): Observable<AboutDownload> {
//     if (!this.isBrowser()) {
//       return new Observable<AboutDownload>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('aboutDownload') && this.aboutDownloadCache()) {
//       const cachedData = this.aboutDownloadCache()!;
//       this.aboutDownloadSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<AboutDownloadResponse>(`${this.baseUrl}about-download`)
//       .pipe(
//         map(response => response.data),
//         tap(data => {
//           this.aboutDownloadCache.set(data);
//           this.updateCacheTimestamp('aboutDownload');
//           this.aboutDownloadSubject.next(data);
//         }),
//         shareReplay(1)
//       );

//     return observable;
//   }

//   getSliders(): Observable<Slider[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Slider[]>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('sliders') && this.slidersCache()) {
//       const cachedData = this.slidersCache()!;
//       this.slidersSubject.next(cachedData);
//       return of(cachedData);
//     }

//     return this.getHomeData().pipe(
//       map(response => response.slider),
//       tap(data => {
//         this.slidersCache.set(data);
//         this.updateCacheTimestamp('sliders');
//         this.slidersSubject.next(data);
//       }),
//       shareReplay(1)
//     );
//   }

//   getCounters(): Observable<Counter[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Counter[]>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('counters') && this.countersCache()) {
//       const cachedData = this.countersCache()!;
//       this.countersSubject.next(cachedData);
//       return of(cachedData);
//     }

//     return this.getHomeData().pipe(
//       map(response => response.counters),
//       tap(data => {
//         this.countersCache.set(data);
//         this.updateCacheTimestamp('counters');
//         this.countersSubject.next(data);
//       }),
//       shareReplay(1)
//     );
//   }

//   getTestimonials(): Observable<Testimonial[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Testimonial[]>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('testimonials') && this.testimonialsCache()) {
//       const cachedData = this.testimonialsCache()!;
//       this.testimonialsSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<TestimonialsResponse>(`${this.baseUrl}testimonials`)
//       .pipe(
//         map(response => response.data),
//         tap(data => {
//           this.testimonialsCache.set(data);
//           this.updateCacheTimestamp('testimonials');
//           this.testimonialsSubject.next(data);
//         }),
//         shareReplay(1)
//       );

//     return observable;
//   }

//   getCategories(): Observable<Category[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Category[]>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('categories') && this.categoriesCache()) {
//       const cachedData = this.categoriesCache()!;
//       this.categoriesSubject.next(cachedData);
//       return of(cachedData);
//     }

//     return this.getHomeData().pipe(
//       map(response => response.categories),
//       tap(data => {
//         this.categoriesCache.set(data);
//         this.updateCacheTimestamp('categories');
//         this.categoriesSubject.next(data);
//       }),
//       shareReplay(1)
//     );
//   }

//   getFeatures(): Observable<Feature[]> {
//     if (!this.isBrowser()) {
//       return new Observable<Feature[]>(observer => {
//         observer.complete();
//       });
//     }

//     if (this.isCacheValid('features') && this.featuresCache()) {
//       const cachedData = this.featuresCache()!;
//       this.featuresSubject.next(cachedData);
//       return of(cachedData);
//     }

//     const observable = this._http.get<FeaturesResponse>(`${this.baseUrl}app-home/getFeatures`)
//       .pipe(
//         map(response => response.features),
//         tap(data => {
//           this.featuresCache.set(data);
//           this.updateCacheTimestamp('features');
//           this.featuresSubject.next(data);
//         }),
//         shareReplay(1)
//       );

//     return observable;
//   }

//   invalidateCache(cacheKey: CacheKey): void {
//     switch (cacheKey) {
//       case 'homeData':
//         this.homeDataCache.set(null);
//         this.homeDataSubject.next(null);
//         break;
//       case 'aboutData':
//         this.aboutDataCache.set(null);
//         this.aboutDataSubject.next(null);
//         break;
//       case 'contactData':
//         this.contactDataCache.set(null);
//         this.contactDataSubject.next(null);
//         break;
//       case 'claimInfo':
//         this.claimInfoCache.set(null);
//         this.claimInfoSubject.next(null);
//         break;
//       case 'aboutDownload':
//         this.aboutDownloadCache.set(null);
//         this.aboutDownloadSubject.next(null);
//         break;
//       case 'sliders':
//         this.slidersCache.set(null);
//         this.slidersSubject.next(null);
//         break;
//       case 'testimonials':
//         this.testimonialsCache.set(null);
//         this.testimonialsSubject.next(null);
//         break;
//       case 'categories':
//         this.categoriesCache.set(null);
//         this.categoriesSubject.next(null);
//         break;
//       case 'features':
//         this.featuresCache.set(null);
//         this.featuresSubject.next(null);
//         break;
//     }
//     this.updateCacheTimestamp(cacheKey, 0);
//   }

//   setCacheExpiration(key: CacheKey, expirationMs: number): void {
//     const now = Date.now();
//     const expiration = now + expirationMs;
//     this.updateCacheTimestamp(key, expiration);
//   }

//   clearAllData(): void {
//     this.homeDataCache.set(null);
//     this.aboutDataCache.set(null);
//     this.contactDataCache.set(null);
//     this.claimInfoCache.set(null);
//     this.aboutDownloadCache.set(null);
//     this.slidersCache.set(null);
//     this.testimonialsCache.set(null);
//     this.categoriesCache.set(null);
//     this.featuresCache.set(null);

//     this.homeDataSubject.next(null);
//     this.aboutDataSubject.next(null);
//     this.contactDataSubject.next(null);
//     this.claimInfoSubject.next(null);
//     this.aboutDownloadSubject.next(null);
//     this.slidersSubject.next(null);
//     this.testimonialsSubject.next(null);
//     this.categoriesSubject.next(null);
//     this.featuresSubject.next(null);

//     this.cacheTimestamps.set({
//       homeData: 0,
//       aboutData: 0,
//       contactData: 0,
//       claimInfo: 0,
//       aboutDownload: 0,
//       sliders: 0,
//       testimonials: 0,
//       categories: 0,
//       features: 0,
//     });
//   }

//   private isCacheValid(key: string): boolean {
//     const timestamp = this.cacheTimestamps()[key] || 0;
//     const now = Date.now();
//     if (timestamp === 0) return false;
//     return now - timestamp < this.CACHE_EXPIRATION;
//   }

//   private updateCacheTimestamp(key: string, time = Date.now()): void {
//     this.cacheTimestamps.update((timestamps) => ({
//       ...timestamps,
//       [key]: time,
//     }));
//   }
// }


import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, OnChanges, SimpleChanges, Input } from '@angular/core';
import { Observable, BehaviorSubject, map, of, tap, shareReplay } from 'rxjs';
import { API_CONFIG } from '@core/conf/api.config';
import { EnglishBlog } from './blogs/english-blogs.service';

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

export interface Slider {
  id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  image: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface SliderResponse {
  success: boolean;
  message: string;
  data: Slider[];
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

export interface Category {
  id: number;
  en_title: string;
  ar_title: string;
  en_slug: string;
  ar_slug: string;
  en_small_description: string;
  ar_small_description: string;
  en_main_description: string;
  ar_main_description: string;
  network_link: string;
  counter_number: number;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface Counter {
  id: number;
  en_name: string;
  ar_name: string;
  counter_value: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface ArabicBlog {
  id: number;
  ar_blog_title: string;
  ar_slug: string;
  ar_blog_text: string;
  main_image: string;
  blog_date: string;
  ar_meta_title: string;
  ar_meta_text: string;
  ar_first_script_text: string;
  ar_second_script_text: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: number;
  category_id: number;
  en_partner_name: string;
  ar_partner_name: string;
  partner_image: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  en_client_name: string;
  ar_client_name: string;
  client_image: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  en_title: string;
  ar_title: string;
  en_description: string;
  ar_description: string;
  icon_image: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface HomeDataResponse {
  medicalPolicy: MedicalPolicy[];
  motorPolicy: MotorPolicy[];
  buildingPolicy: BuildingPolicy[];
  categories: Category[];
  counters: Counter[];
  ArabicBlog: ArabicBlog[];
  EnglishBlog: EnglishBlog[];
  partners: Partner[];
  clients: Client[];
  slider: Slider[];
  features: Feature[];
}

export interface AboutData {
  id: number;
  en_main_title: string;
  ar_main_title: string;
  en_main_content: string;
  ar_main_content: string;
  main_image: string;
  en_mission: string;
  en_about_first_feature_title: string;
  ar_about_first_feature_title: string;
  en_about_second_feature_title: string;
  ar_about_second_feature_title: string;
  en_about_first_feature_text: string;
  ar_about_first_feature_text: string;
  years_of_experience: string;
  en_about_second_feature_text: string;
  ar_about_second_feature_text: string;
  ar_mission: string;
  en_vision: string;
  ar_vision: string;
  en_values_title: string;
  ar_values_title: string;
  en_values_text: string;
  ar_values_text: string;
  en_history_title: string;
  ar_history_title: string;
  en_history_text: string;
  ar_history_text: string;
  history_image: string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  active_status: string;
  created_at: string | null;
  updated_at: string;
}

export interface AboutCounter {
  id: number;
  en_name: string;
  ar_name: string;
  counter_value: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface AboutDataResponse {
  about: AboutData;
  counters: AboutCounter[];
}

export interface Testimonial {
  id: number;
  en_name: string;
  ar_name: string;
  en_position: string;
  ar_position: string;
  en_text: string;
  ar_text: string;
  image: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface TestimonialsResponse {
  success: boolean;
  message: string;
  data: Testimonial[];
}

export interface ContactData {
  id: number;
  en_address: string;
  ar_address: string;
  google_plus: string;
  first_phone: string;
  second_phone: string;
  third_phone: string;
  fourth_phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_description: string;
  ar_meta_description: string;
  en_contact_title: string;
  ar_contact_title: string;
  en_contact_text: string;
  ar_contact_text: string;
  active_status: string;
  created_at: string;
  updated_at: string;
}

export interface ContactDataResponse {
  contact: ContactData;
}

export interface ClaimInfo {
  id: number;
  en_main_title: string;
  ar_main_title: string;
  en_main_text: string;
  ar_main_text: string;
  en_meta_title: string;
  ar_meta_title: string;
  en_meta_text: string;
  ar_meta_text: string;
  created_at: string;
  en_second_title: string;
  ar_second_title: string;
  en_second_text: string;
  ar_second_text: string;
  updated_at: string;
}

export interface ClaimInfoResponse {
  success: boolean;
  message: string;
  data: ClaimInfo;
}

export interface AboutDownload {
  id: number;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  android_download_link: string;
  ios_download_link: string;
  elwinsh_link: string;
  active_status: string;
  created_at: string | null;
  updated_at: string;
}

export interface AboutDownloadResponse {
  success: boolean;
  message: string;
  data: AboutDownload;
}

export interface FeaturesResponse {
  success: boolean;
  message: string;
  features: Feature[];
}

type CacheKey = 'homeData' | 'aboutData' | 'contactData' | 'claimInfo' | 'aboutDownload' | 'sliders' | 'testimonials' | 'categories' | 'features' | 'counters' | 'partners';

@Injectable({
  providedIn: 'root',
})
export class UpdatedGenericDataService implements OnChanges {
  private _http = inject(HttpClient);
  private baseUrl = API_CONFIG.BASE_URL;

  private readonly CACHE_EXPIRATION = 5 * 60 * 1000;

  private homeDataCache = signal<HomeDataResponse | null>(null);
  private aboutDataCache = signal<AboutDataResponse | null>(null);
  private contactDataCache = signal<ContactDataResponse | null>(null);
  private claimInfoCache = signal<ClaimInfo | null>(null);
  private aboutDownloadCache = signal<AboutDownload | null>(null);
  private slidersCache = signal<Slider[] | null>(null);
  private testimonialsCache = signal<Testimonial[] | null>(null);
  private categoriesCache = signal<Category[] | null>(null);
  private featuresCache = signal<Feature[] | null>(null);
  private countersCache = signal<Counter[] | null>(null);
  private partnersCache = signal<Partner[] | null>(null);

  private cacheTimestamps = signal<Record<string, number>>({
    homeData: 0,
    aboutData: 0,
    contactData: 0,
    claimInfo: 0,
    aboutDownload: 0,
    sliders: 0,
    testimonials: 0,
    categories: 0,
    features: 0,
    counters: 0,
    partners: 0,
  });

  private homeDataSubject = new BehaviorSubject<HomeDataResponse | null>(null);
  private aboutDataSubject = new BehaviorSubject<AboutDataResponse | null>(null);
  private contactDataSubject = new BehaviorSubject<ContactDataResponse | null>(null);
  private claimInfoSubject = new BehaviorSubject<ClaimInfo | null>(null);
  private aboutDownloadSubject = new BehaviorSubject<AboutDownload | null>(null);
  private slidersSubject = new BehaviorSubject<Slider[] | null>(null);
  private testimonialsSubject = new BehaviorSubject<Testimonial[] | null>(null);
  private categoriesSubject = new BehaviorSubject<Category[] | null>(null);
  private featuresSubject = new BehaviorSubject<Feature[] | null>(null);
  private countersSubject = new BehaviorSubject<Counter[] | null>(null);
  private partnersSubject = new BehaviorSubject<Partner[] | null>(null);

  homeData$ = this.homeDataSubject.asObservable();
  aboutData$ = this.aboutDataSubject.asObservable();
  contactData$ = this.contactDataSubject.asObservable();
  claimInfo$ = this.claimInfoSubject.asObservable();
  aboutDownload$ = this.aboutDownloadSubject.asObservable();
  sliders$ = this.slidersSubject.asObservable();
  testimonials$ = this.testimonialsSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  features$ = this.featuresSubject.asObservable();
  counters$ = this.countersSubject.asObservable();
  partners$ = this.partnersSubject.asObservable();

  @Input() policyType: 'medical' | 'motor' | 'property' | null = null;

  get homeData() {
    return this.homeDataCache;
  }

  get counters() {
    return this.countersCache;
  }

  get aboutData() {
    return this.aboutDataCache;
  }

  get contactData() {
    return this.contactDataCache;
  }

  get claimInfo() {
    return this.claimInfoCache;
  }

  get aboutDownload() {
    return this.aboutDownloadCache;
  }

  get sliders() {
    return this.slidersCache;
  }

  get testimonials() {
    return this.testimonialsCache;
  }

  get categories() {
    return this.categoriesCache;
  }

  get features() {
    return this.featuresCache;
  }

  get partners() {
    return this.partnersCache;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['policyType'] && this.isBrowser()) {
      this.getPartners().subscribe();
    }
  }

  fetchAllData(): void {
    if (!this.isBrowser()) return;

    // this.getSliders().subscribe();
    // this.getCategories().subscribe();
    // this.getFeatures().subscribe();
    // this.getCounters().subscribe();
    // this.getPartners().subscribe();
  }

  getHomeData(): Observable<HomeDataResponse> {
    if (!this.isBrowser()) {
      return new Observable<HomeDataResponse>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('homeData') && this.homeDataCache()) {
      const cachedData = this.homeDataCache()!;
      this.homeDataSubject.next(cachedData);
      this.partnersSubject.next(cachedData.partners);
      return of(cachedData);
    }

    const observable = this._http.get<HomeDataResponse>(`${this.baseUrl}app-home/getHomeData`).pipe(
      tap(data => {
        this.homeDataCache.set(data);
        this.updateCacheTimestamp('homeData');
        this.homeDataSubject.next(data);
      }),
      shareReplay(1)
    );

    return observable;
  }

  getAboutData(): Observable<AboutDataResponse> {
    if (!this.isBrowser()) {
      return new Observable<AboutDataResponse>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('aboutData') && this.aboutDataCache()) {
      const cachedData = this.aboutDataCache()!;
      this.aboutDataSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<AboutDataResponse>(`${this.baseUrl}app-home/getAboutData`).pipe(
      tap(data => {
        this.aboutDataCache.set(data);
        this.updateCacheTimestamp('aboutData');
        this.aboutDataSubject.next(data);
      }),
      shareReplay(1)
    );

    return observable;
  }

  getContactData(): Observable<ContactDataResponse> {
    if (!this.isBrowser()) {
      return new Observable<ContactDataResponse>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('contactData') && this.contactDataCache()) {
      const cachedData = this.contactDataCache()!;
      this.contactDataSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<ContactDataResponse>(`${this.baseUrl}app-home/getContactData`).pipe(
      tap(data => {
        this.contactDataCache.set(data);
        this.updateCacheTimestamp('contactData');
        this.contactDataSubject.next(data);
      }),
      shareReplay(1)
    );

    return observable;
  }

  getClaimInfo(id: number): Observable<ClaimInfo> {
    if (!this.isBrowser()) {
      return new Observable<ClaimInfo>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('claimInfo') && this.claimInfoCache()) {
      const cachedData = this.claimInfoCache()!;
      this.claimInfoSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
      .pipe(
        map(response => response.data),
        tap(data => {
          this.claimInfoCache.set(data);
          this.updateCacheTimestamp('claimInfo');
          this.claimInfoSubject.next(data);
        }),
        shareReplay(1)
      );

    return observable;
  }

  getClaimInfoOnce(id: number): Observable<ClaimInfo> {
    return this._http.get<ClaimInfoResponse>(`${this.baseUrl}claim-info/${id}`)
      .pipe(map(response => response.data));
  }

  getAboutDownload(): Observable<AboutDownload> {
    if (!this.isBrowser()) {
      return new Observable<AboutDownload>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('aboutDownload') && this.aboutDownloadCache()) {
      const cachedData = this.aboutDownloadCache()!;
      this.aboutDownloadSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<AboutDownloadResponse>(`${this.baseUrl}about-download`)
      .pipe(
        map(response => response.data),
        tap(data => {
          this.aboutDownloadCache.set(data);
          this.updateCacheTimestamp('aboutDownload');
          this.aboutDownloadSubject.next(data);
        }),
        shareReplay(1)
      );

    return observable;
  }

  getSliders(): Observable<Slider[]> {
    if (!this.isBrowser()) {
      return new Observable<Slider[]>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('sliders') && this.slidersCache()) {
      const cachedData = this.slidersCache()!;
      this.slidersSubject.next(cachedData);
      return of(cachedData);
    }

    return this.getHomeData().pipe(
      map(response => response.slider),
      tap(data => {
        this.slidersCache.set(data);
        this.updateCacheTimestamp('sliders');
        this.slidersSubject.next(data);
      }),
      shareReplay(1)
    );
  }

  getCounters(): Observable<Counter[]> {
    if (!this.isBrowser()) {
      return new Observable<Counter[]>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('counters') && this.countersCache()) {
      const cachedData = this.countersCache()!;
      this.countersSubject.next(cachedData);
      return of(cachedData);
    }

    return this.getHomeData().pipe(
      map(response => response.counters),
      tap(data => {
        console.log(data);
        this.countersCache.set(data);
        this.updateCacheTimestamp('counters');
        this.countersSubject.next(data);
      }),
      shareReplay(1)
    );
  }

  getTestimonials(): Observable<Testimonial[]> {
    if (!this.isBrowser()) {
      return new Observable<Testimonial[]>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('testimonials') && this.testimonialsCache()) {
      const cachedData = this.testimonialsCache()!;
      this.testimonialsSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<TestimonialsResponse>(`${this.baseUrl}testimonials`)
      .pipe(
        map(response => response.data),
        tap(data => {
          this.testimonialsCache.set(data);
          this.updateCacheTimestamp('testimonials');
          this.testimonialsSubject.next(data);
        }),
        shareReplay(1)
      );

    return observable;
  }

  getCategories(): Observable<Category[]> {
    if (!this.isBrowser()) {
      return new Observable<Category[]>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('categories') && this.categoriesCache()) {
      const cachedData = this.categoriesCache()!;
      this.categoriesSubject.next(cachedData);
      return of(cachedData);
    }

    return this.getHomeData().pipe(
      map(response => response.categories),
      tap(data => {
        this.categoriesCache.set(data);
        this.updateCacheTimestamp('categories');
        this.categoriesSubject.next(data);
      }),
      shareReplay(1)
    );
  }

  getFeatures(): Observable<Feature[]> {
    if (!this.isBrowser()) {
      return new Observable<Feature[]>(observer => {
        observer.complete();
      });
    }

    if (this.isCacheValid('features') && this.featuresCache()) {
      const cachedData = this.featuresCache()!;
      this.featuresSubject.next(cachedData);
      return of(cachedData);
    }

    const observable = this._http.get<FeaturesResponse>(`${this.baseUrl}app-home/getFeatures`)
      .pipe(
        map(response => response.features),
        tap(data => {
          this.featuresCache.set(data);
          this.updateCacheTimestamp('features');
          this.featuresSubject.next(data);
        }),
        shareReplay(1)
      );

    return observable;
  }
  getPartners(): Observable<Partner[]> {
    if (!this.isBrowser()) {
      return new Observable<Partner[]>(observer => {
        observer.complete();
      });
    }
  
    if (this.isCacheValid('partners') && this.partnersCache()) {
      const cachedData = this.partnersCache()!;
      const filteredData = this.filterPartners(cachedData);
      this.partnersSubject.next(filteredData);
      return of(filteredData);
    }
  
    // If cache is empty, force fetch home data to populate partners
    return this._http.get<HomeDataResponse>(`${this.baseUrl}app-home/getHomeData`).pipe(
      map(response => response.partners),
      tap(data => {
        this.partnersCache.set(data);
        this.updateCacheTimestamp('partners');
        const filteredData = this.filterPartners(data);
        this.partnersSubject.next(filteredData);
      }),
      map(data => this.filterPartners(data)),
      shareReplay(1)
    );
  }

  private filterPartners(partners: Partner[]): Partner[] {
    if (!this.policyType) return partners;
    const categoryIdMap: { [key: string]: number } = {
      medical: 1,
      motor: 2,
      property: 3,
    };
    const categoryId = categoryIdMap[this.policyType];
    return partners.filter(partner => partner.category_id === categoryId);
  }

  invalidateCache(cacheKey: CacheKey): void {
    switch (cacheKey) {
      case 'homeData':
        this.homeDataCache.set(null);
        this.homeDataSubject.next(null);
        break;
      case 'aboutData':
        this.aboutDataCache.set(null);
        this.aboutDataSubject.next(null);
        break;
      case 'contactData':
        this.contactDataCache.set(null);
        this.contactDataSubject.next(null);
        break;
      case 'claimInfo':
        this.claimInfoCache.set(null);
        this.claimInfoSubject.next(null);
        break;
      case 'aboutDownload':
        this.aboutDownloadCache.set(null);
        this.aboutDownloadSubject.next(null);
        break;
      case 'sliders':
        this.slidersCache.set(null);
        this.slidersSubject.next(null);
        break;
      case 'testimonials':
        this.testimonialsCache.set(null);
        this.testimonialsSubject.next(null);
        break;
      case 'categories':
        this.categoriesCache.set(null);
        this.categoriesSubject.next(null);
        break;
      case 'features':
        this.featuresCache.set(null);
        this.featuresSubject.next(null);
        break;
      case 'partners':
        this.partnersCache.set(null);
        this.partnersSubject.next(null);
        break;
    }
    this.updateCacheTimestamp(cacheKey, 0);
  }

  setCacheExpiration(key: CacheKey, expirationMs: number): void {
    const now = Date.now();
    const expiration = now + expirationMs;
    this.updateCacheTimestamp(key, expiration);
  }

  clearAllData(): void {
    this.homeDataCache.set(null);
    this.aboutDataCache.set(null);
    this.contactDataCache.set(null);
    this.claimInfoCache.set(null);
    this.aboutDownloadCache.set(null);
    this.slidersCache.set(null);
    this.testimonialsCache.set(null);
    this.categoriesCache.set(null);
    this.featuresCache.set(null);
    this.partnersCache.set(null);

    this.homeDataSubject.next(null);
    this.aboutDataSubject.next(null);
    this.contactDataSubject.next(null);
    this.claimInfoSubject.next(null);
    this.aboutDownloadSubject.next(null);
    this.slidersSubject.next(null);
    this.testimonialsSubject.next(null);
    this.categoriesSubject.next(null);
    this.featuresSubject.next(null);
    this.partnersSubject.next(null);

    this.cacheTimestamps.set({
      homeData: 0,
      aboutData: 0,
      contactData: 0,
      claimInfo: 0,
      aboutDownload: 0,
      sliders: 0,
      testimonials: 0,
      categories: 0,
      features: 0,
      partners: 0,
    });
  }

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps()[key] || 0;
    const now = Date.now();
    if (timestamp === 0) return false;
    return now - timestamp < this.CACHE_EXPIRATION;
  }

  private updateCacheTimestamp(key: string, time = Date.now()): void {
    this.cacheTimestamps.update((timestamps) => ({
      ...timestamps,
      [key]: time,
    }));
  }
}