import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { PartenersSectionComponent } from './parteners-section/parteners-section.component';
import { CategoriesComponent } from './categories/categories.component';
import { BillComponent } from './bill/bill.component';
import { TestimonialsSectionComponent } from './testimonials-section/testimonials-section.component';
import { ClientsComponent } from './clients/clients.component';
import { HomeFormComponent } from './home-form/home-form.component';
import { BlogsPageComponent } from '../blogs/blogs-page/blogs-page.component';
import { AboutComponent } from '../about/about/about.component';
import { API_CONFIG } from '@core/conf/api.config';
import { Counter, Slider, HomeDataResponse, Testimonial, UpdatedGenericDataService } from '@core/services/updated-general.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    HeroSectionComponent,
    PartenersSectionComponent,
    CategoriesComponent,
    BillComponent,
    TestimonialsSectionComponent,
    ClientsComponent,
    HomeFormComponent,
    BlogsPageComponent,
    CommonModule,
    AboutComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedDate: Date | null = null;
  partners: { en_name: string; ar_name: string; image: string; alt: string }[] = [];
  clients: { name: string; image: string; alt: string }[] = [];
  sliders: Slider[] = [];
  
  counters: Counter[] = [];
  testimonials: Testimonial[] = [];
  
  private subscription: Subscription = new Subscription();
  private image_url = API_CONFIG.BASE_URL_IMAGE;
  
  // Track loading state for better UX
  isDataLoaded = false;
  
  constructor(
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initiate data fetching immediately
    this.genericDataService.fetchAllData();
    
    this.subscription = this.genericDataService.homeData$.subscribe((data: HomeDataResponse | null) => {
      if (data) {
        this.partners = data.partners.map(partner => ({
          ar_name: partner.ar_partner_name,
          en_name: partner.en_partner_name,
          image: this.image_url + partner.partner_image,
          alt: `${partner.en_partner_name} Logo`
        }));
        
        this.clients = data.clients.map(client => ({
          name: client.en_client_name,
          image: this.image_url + client.client_image,
          alt: `${client.en_client_name} Company Logo`
        }));
        
        this.counters = data.counters;
        this.sliders = data.slider;
        this.isDataLoaded = true;
        this.cdr.markForCheck();
      }
    });

    this.subscription.add(
      this.genericDataService.sliders$.subscribe(sliders => {
        if (sliders) {
          this.sliders = sliders;
          this.cdr.markForCheck();
        }
      })
    );

    this.subscription.add(
      this.genericDataService.testimonials$.subscribe(testimonials => {
        if (testimonials) {
          this.testimonials = testimonials;
          console.log(this.testimonials)
          this.cdr.markForCheck();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // TrackBy functions for better performance
  trackByPartnerId(index: number, partner: any): string {
    return partner.name;
  }

  trackByClientId(index: number, client: any): string {
    return client.name;
  }

  trackBySliderId(index: number, slider: Slider): number {
    return slider.id;
  }

  trackByTestimonialId(index: number, testimonial: Testimonial): number {
    return testimonial.id;
  }
}