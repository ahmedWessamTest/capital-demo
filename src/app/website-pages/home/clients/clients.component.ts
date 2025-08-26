// import { TranslateModule } from '@ngx-translate/core';
// import { Component, ViewChild, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
// import { CommonModule } from '@angular/common';
// import { HeadingComponent } from '@core/shared/heading/heading.component';
// import { LanguageService } from '../../../core/services/language.service';
// import { Subscription } from 'rxjs';
// @Component({
//   selector: 'app-clients',
//   standalone: true,
//   imports: [CarouselModule, CommonModule, HeadingComponent,TranslateModule],
//   templateUrl: './clients.component.html',
//   styleUrls: ['./clients.component.css']
// })
// export class ClientsComponent implements OnInit, OnDestroy, OnChanges {
//   @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;
//   @Input() clients: { name: string; image: string; alt: string }[] = [];

//   isRtl: boolean = false;
//   private languageSubscription!: Subscription;

//   clientsList: { name: string; image: string; alt: string }[] = [];

//   customOptions: OwlOptions = {
//     loop: true,
//     mouseDrag: true,
//     touchDrag: true,
//     pullDrag: true,
//     dots: false,
//     margin: 5,
//     navSpeed: 700,
//     smartSpeed: 700,
//     autoWidth: false,
//     navText: ['<', '>'],
//     center: true,
//     nav: false,
//     rtl: this.isRtl,
//     skip_validateItems: true,
//     responsive: {
//       0: { items: 1 },
//       400: { items: 3 },
//       600: { items: 5 },
//       900: { items: 7 }
//     }
//   };

//   constructor(private languageService: LanguageService) {}

//   ngOnInit(): void {
//     // Initialize clientsList with input data if available
//     this.updateClientsList();
// console.log(this.clientsList);
//     // Subscribe to language changes to update RTL option
//     this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
//       this.isRtl = lang === 'ar';
//       this.customOptions = { ...this.customOptions, rtl: this.isRtl };
//       if (this.owlCarousel && this.clientsList.length > 0) {
//         this.owlCarousel.to(this.clientsList[0].name);
//       }
//     });
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     // Update clientsList when input changes
//     if (changes['clients']) {
//       this.updateClientsList();
//     }
//   }

//   ngOnDestroy(): void {
//     // Unsubscribe to prevent memory leaks
//     if (this.languageSubscription) {
//       this.languageSubscription.unsubscribe();
//     }
//   }

//   /**
//    * Updates clientsList based on input clients
//    */
//   private updateClientsList(): void {
//     console.log(this.clients);
//     this.clientsList = this.clients.length > 0
//       ? this.clients
//       : [
//           { name: 'Client 2', image: '/assets/clients/6.png', alt: 'Client 2 Company Logo' },
//         ];
//   }

//   /**
//    * Toggles the carousel direction (for manual testing if needed)
//    */
//   toggleDirection(): void {
//     this.isRtl = !this.isRtl;
//     this.customOptions = { ...this.customOptions, rtl: this.isRtl };
//     const currentSlide = this.clientsList[0].name;
//     this.owlCarousel.to(currentSlide);
//   }

//   prev(): void {
//     this.owlCarousel.prev();
//   }

//   next(): void {
//     this.owlCarousel.next();
//   }
// }

import { TranslateModule } from '@ngx-translate/core';
import { Component, ViewChild, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';
import { HeadingComponent } from '@core/shared/heading/heading.component';
import { LanguageService } from '../../../core/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CarouselModule, CommonModule, HeadingComponent, TranslateModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ClientsComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;
  @Input() clients: { name: string; image: string; alt: string }[] = [];

  isRtl: boolean = false;
  private languageSubscription!: Subscription;
  isImageLoaded: { [key: string]: boolean } = {};

  clientsList: { name: string; image: string; alt: string }[] = [];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    margin: 5,
    navSpeed: 700,
    smartSpeed: 700,
    autoWidth: false,
    navText: ['<', '>'],
    center: true,
    nav: false,
    rtl: this.isRtl,
    skip_validateItems: true,
    responsive: {
      0: { items: 1 },
      400: { items: 3 },
      600: { items: 5 },
      900: { items: 7 }
    }
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.updateClientsList();
    console.log(this.clientsList);
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(lang => {
      this.isRtl = lang === 'ar';
      this.customOptions = { ...this.customOptions, rtl: this.isRtl };
      if (this.owlCarousel && this.clientsList.length > 0) {
        this.owlCarousel.to(this.clientsList[0].name);
      }
    });
    this.initializeImageLoadStates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clients']) {
      this.updateClientsList();
      this.initializeImageLoadStates();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private updateClientsList(): void {
    console.log(this.clients);
    this.clientsList = this.clients.length > 0
      ? this.clients
      : [
          { name: 'Client 2', image: '/assets/clients/6.png', alt: 'Client 2 Company Logo' },
        ];
  }

  private initializeImageLoadStates(): void {
    this.clientsList.forEach(client => {
      this.isImageLoaded[client.name] = false;
    });
  }

  onImageLoad(clientName: string): void {
    this.isImageLoaded[clientName] = true;
  }

  toggleDirection(): void {
    this.isRtl = !this.isRtl;
    this.customOptions = { ...this.customOptions, rtl: this.isRtl };
    const currentSlide = this.clientsList[0].name;
    this.owlCarousel.to(currentSlide);
  }

  prev(): void {
    this.owlCarousel.prev();
  }

  next(): void {
    this.owlCarousel.next();
  }
}