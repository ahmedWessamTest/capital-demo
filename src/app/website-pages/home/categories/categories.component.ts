import { LanguageService } from './../../../core/services/language.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Router, RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HeadingComponent } from "../../../core/shared/heading/heading.component";
import { TranslateModule } from '@ngx-translate/core';
interface InsuranceCard {
  id: string;
  title: string;
  titleAr: string;
  imageUrl: string;
  altText: string;
  linkTitle: string;
  linkAriaLabel: string;
  link: string;
}
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CarouselModule, RouterLink, HeadingComponent, TranslateModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,

  animations: [
    trigger('activeSlide', [
      state('active', style({
        transform: 'scale(1.1)',
        // opacity: 1,
        'z-index': 10,
        position: 'absolute',
      })),
      state('inActive', style({
        transform: 'scale(0.8)',
        // opacity: 0.8,
        position: 'relative',
      })),
      transition('active => inActive', [
        animate('0.5s')
      ]),
      transition('inActive => active', [
        animate('0.5s')
      ])
    ])
  ],
})
export class CategoriesComponent {

  cards: InsuranceCard[] = [
    {
      id: 'motor-insurance',
      title: 'Motor Insurance',
      titleAr: 'تأمين السيارات',
      imageUrl: 'assets/categories/motor.PNG', // Replace with 'assets/categories/motor.jpg'
      altText: 'Motor Insurance category',
      linkTitle: 'Go to Motor Insurance',
      linkAriaLabel: 'Go to Motor Insurance category',
      link: '/motor-insurance'
    },
    {
      id: 'property-insurance',
      titleAr: 'تأمين العقارات',
      title: 'Property Insurance',
      imageUrl: 'assets/categories/propert.PNG', // Replace with 'assets/categories/propert.jpg'
      altText: 'Property Insurance category',
      linkTitle: 'Go to Property Insurance',
      linkAriaLabel: 'Go to Property Insurance category',
      link: '/building-insurance'
    },
    {
      id: 'medical-insurance',
      titleAr: 'التامين الصحي',
      title: 'Medical Insurance',
      imageUrl: 'assets/categories/medical.PNG', // Replace with 'assets/categories/medical.jpg'
      altText: 'Medical Insurance category',
      linkTitle: 'Go to Medical Insurance',
      linkAriaLabel: 'Go to Medical Insurance category',
      link: '/medical-insurance'
    },
    {
      id: 'job-insurance',
      titleAr: 'التامين الوظيفي',
      title: 'Professional Indemnity',
      imageUrl: './assets/categories/job.png', // Replace with 'assets/categories/medical.jpg'
      altText: ' Professional Indemnity Insurance category',
      linkTitle: 'Go to  Professional Indemnity ',
      linkAriaLabel: 'Go to  Professional Indemnity Insurance category',
      link: '/job-insurance'
    }
  ];
  lang: string = '';
  constructor(private LanguageService: LanguageService) {
    this.LanguageService.currentLanguage$.subscribe(lang => {
      this.lang = lang;
    });
  }

  ngOnInit(): void {
    // Initialization logic can go here if needed
    this.LanguageService.currentLanguage$.subscribe(lang => {
    });
  }


  // Optional: A method to handle clicks on the cards
  // You would typically use Angular Router here to navigate
  onCardClick(cardId: string): void {
    console.log(`Card clicked: ${cardId}. You would navigate to a specific route here.`);
    // Example: this.router.navigate(['/insurance', cardId]);
  }
}
