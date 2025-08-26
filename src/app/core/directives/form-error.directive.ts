import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Directive({
  selector: '[appFormError]',
  standalone: true,
})
export class FormErrorDirective implements OnInit, OnDestroy {
  @Input() displayName: string = '';
  private errorContainer: HTMLElement | null = null;
  private hasInteracted = false;
  private statusChangeSubscription?: Subscription;
  private languageSubscription?: Subscription;

  constructor(
    private el: ElementRef,
    @Optional() private control: NgControl,
    private renderer: Renderer2,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (!this.control) {
      console.warn('FormErrorDirective: NgControl not found. Make sure the element has a form control.');
      return;
    }

    this.createErrorContainer();
    this.subscribeToStatusChanges();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy() {
    this.statusChangeSubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
  }

  private createErrorContainer() {
    const parent = this.el.nativeElement.parentElement;
    if (!parent) return;

    const existingContainer = parent.querySelector('.error-container');
    if (!existingContainer) {
      this.errorContainer = this.renderer.createElement('div');
      this.renderer.addClass(this.errorContainer, 'error-container');
      this.renderer.appendChild(parent, this.errorContainer);
    } else {
      this.errorContainer = existingContainer as HTMLElement;
    }
  }

  private subscribeToStatusChanges() {
    if (this.control?.statusChanges) {
      this.statusChangeSubscription = this.control.statusChanges.subscribe(() => {
        this.showError();
      });
    }
  }

  private subscribeToLanguageChanges() {
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(() => {
      this.showError(); // Update error message when language changes
    });
  }

  @HostListener('focus') onFocus() {
    this.hasInteracted = true;
    this.showError();
  }

  @HostListener('blur') onBlur() {
    this.hasInteracted = true;
    this.showError();
  }

  @HostListener('input') onInput() {
    this.hasInteracted = true;
    this.showError();
  }

  private showError() {
    if (!this.control) return;

    const control = this.control.control as FormControl;
    if (!control) return;

    const errorId = `error-${this.el.nativeElement.id || 'field'}`;

    // Set aria attributes
    this.renderer.setAttribute(this.el.nativeElement, 'aria-invalid', control.invalid && (this.hasInteracted || control.touched || control.dirty) ? 'true' : 'false');
    if (control.invalid && (this.hasInteracted || control.touched || control.dirty)) {
      this.renderer.setAttribute(this.el.nativeElement, 'aria-describedby', errorId);
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
    }

    const errorKey = this.getErrorMessageKey();

    if (this.errorContainer && errorKey) {
      this.translate.get(errorKey.key, errorKey.params || {}).subscribe((message) => {
        this.renderer.setProperty(
          this.errorContainer,
          'innerHTML',
          `<span class="error-message" id="${errorId}">${message}</span>`
        );
      });
    }
     else {
      this.renderer.removeClass(this.el.nativeElement, 'error');
      if (this.errorContainer) {
        this.renderer.setProperty(this.errorContainer, 'innerHTML', '');
      }
    }
  }

  private getErrorMessageKey(): { key: string; params?: any } | null {
    if (!this.control?.control) return null;
  
    const control = this.control.control as FormControl;
    const fieldName = this.displayName || this.el.nativeElement.placeholder || 'Field';
  
    if (control.errors?.['required']) {
      return { key: 'ERRORS.REQUIRED', params: { field: fieldName } };
    }
  
    if (control.errors?.['email']) return { key: 'ERRORS.INVALID_EMAIL' };
    if (control.errors?.['minlength']) return { key: 'ERRORS.MINLENGTH', params: { field: fieldName } };
    if (control.errors?.['pattern']) return { key: 'ERRORS.INVALID_PHONE' };
    if (control.errors?.['negativeNumber']) return { key: 'ERRORS.NEGATIVE_NUMBER' };
    if (control.errors?.['invalidNumber']) return { key: 'ERRORS.INVALID_NUMBER' };
  
    return null;
  }
  
}