import { ChangeDetectorRef, Component } from '@angular/core';
import { ContactData, UpdatedGenericDataService } from '@core/services/updated-general.service';

@Component({
  selector: 'app-whatsapp-float',
  standalone: true,
  imports: [],
  template: `
    <a
      href="https://wa.me/{{ contactData?.whatsapp }}"
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-float start-0"
      aria-label="Contact us on WhatsApp"
    >
      <img
        src="whatsapp.png"
        alt=""
        class="whatsapp-icon"
        aria-hidden="true"
      />
    </a>
  `,
  styles: [
    `
      .whatsapp-float {
        position: fixed;
        bottom: 30px;

        z-index: 1000;
        transition: transform 0.3s ease-in-out;
      }

      .whatsapp-icon {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
      }

      .whatsapp-float:hover {
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .whatsapp-icon {
          width: 60px;
          height: 60px;
        }
      }
    `,
  ],
})
export class WhatsappFloatComponent {
  contactData: ContactData | null = null;

  constructor(
    private genericDataService: UpdatedGenericDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.genericDataService.getContactData().subscribe(data => {
      this.contactData = data.contact;
      console.log(this.contactData);
      this.cdr.detectChanges();
    });
  }
}