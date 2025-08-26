import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Import TranslateService

export interface DropdownOption {
  title: string;
  code: string;
  agreed: boolean;
}

@Component({
  selector: 'app-custome-drop-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="relative">
      <!-- Display of the selected item -->
      <div
        class="w-[100%] p-4 rounded-[30px] px-8 h-[73px] cursor-pointer flex justify-between items-center bg-white shadow"
        (click)="toggleDropdown()">
        <span *ngIf="selectedOption; else placeholder" class="flex gap-4 min-w-0">
          <div class="flex-shrink-0">+</div>
          <!-- Truncate selected option title -->
          <div class="min-w-0 truncate">{{ selectedOption.title }}</div>
          <!-- Truncate selected option code -->
          <div class=" hidden md:flex flex-1 text-center text-gray-500 min-w-0 truncate">
            ({{ 'dropdown.policy_code_prefix' | translate }} {{ selectedOption.code }})
          </div>
          <div class=" md:hidden flex-1 text-center text-gray-500 min-w-0 truncate">
            ( {{ selectedOption.code }})
          </div>
        </span>
        <ng-template #placeholder>
          {{ 'dropdown.select_option' | translate }}
        </ng-template>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Dropdown options container -->
      <div
        *ngIf="isOpen"
        class="absolute w-[100%] bg-white rounded-[30px] shadow mt-1 z-10">

        <!-- Scrollable options area -->
        <div class="max-h-[120px] md:max-h-[200px] overflow-y-auto">
          <div *ngIf="isLoading" class="px-8 py-2 text-center text-gray-500 h-[48px] flex items-center justify-center">
            {{ 'dropdown.loading' | translate }}
          </div>
          <div *ngIf="!isLoading && options.length === 0" class="px-8 py-2 text-center text-gray-500 h-[48px] flex items-center justify-center">
            {{ 'dropdown.no_policies_available' | translate }}
          </div>
          <ng-container *ngIf="!isLoading && options.length > 0">
            <div
              *ngFor="let option of options"
              class="px-8 py-1 md:py-2 hover:bg-gray-100 cursor-pointer h-[40px] md:h-[70px] flex items-center"> <!-- Fixed height for each option -->
              <div class="flex items-center w-full min-w-0" (click)="selectOption(option)">
                <div class="text-xl text-green-500 font-bold flex-shrink-0 mr-2">+</div>
                <!-- Truncate option title -->
                <div class="font-semibold min-w-0 text-[12px] md:text-[14px] truncate">{{ option.title }}</div>
                <!-- Truncate option code -->
                <div class="hidden md:flex text-gray-400 text-sm flex-1 text-center ms-2 min-w-0 truncate">
                  {{ 'dropdown.policy_code_prefix_short' | translate }} "{{ option.code }}"
                </div>
                <div class="md:hidden text-gray-400 text-[12px] flex-1 text-center ms-2 min-w-0 truncate">
                  "{{ option.code }}"
                </div>
                <label class=" hidden md:flex custom-checkbox-wrapper  gap-2 items-center text-sky-400 text-sm flex-shrink-0 ml-4">
                  {{ 'dropdown.agree_to_terms' | translate }}
                  <input type="checkbox" class="hidden-checkbox" [(ngModel)]="option.agreed" />
                  <span class="styled-checkbox cursor-pointer"></span>
                </label>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- "Add manual policy" fixed at the bottom -->
        <div (click)="onManualPolicyAdd()" *ngIf="!isLoading" class="w-full p-2 md:p-4 flex items-center gap-4  px-8 cursor-pointer border-t border-gray-200 h-[70px]">
          <div>
            <img src="./assets/icons/plus.png" alt="Add Icon">
          </div>
          <div class="flex cursor-pointer justify-around choose-from-your-policies text-base sm:text-lg md:text-xl flex-1 min-w-0 truncate">
            {{ 'dropdown.add_manual_policy' | translate }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./custome-drop-menu.component.css']
})
export class CustomeDropMenuComponent implements OnChanges {
  @Input() options: DropdownOption[] = [];
  @Input() isLoading: boolean = false;
  @Output() selected = new EventEmitter<DropdownOption>();
  @Output() manualPolicyAdd = new EventEmitter<void>(); // This output remains for specific manual add handling if needed

  isOpen = false;
  selectedOption?: DropdownOption;

  // Define a special option for "Add manual policy"
  manualAddOption: DropdownOption = {
    title: 'dropdown.add_manual_policy', // Using the translation key
    code: 'MANUAL', // A unique code to identify this option
    agreed: false // No agreement needed for this action
  };

  constructor(private translate: TranslateService) {} // Inject TranslateService

  ngOnChanges(changes: SimpleChanges): void {
    // Reset selected option when options change (e.g., when switching insurance types)
    if (changes['options']) {
      this.selectedOption = undefined;
    }

    // Auto-open dropdown when loading starts
    if (changes['isLoading'] && this.isLoading) {
      this.isOpen = true;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: DropdownOption) {
    // Ensure only the selected option has 'agreed' set to true
    this.options.forEach(opt => {
      opt.agreed = opt === option;
    });
    this.selectedOption = option;
    this.isOpen = false;
    this.selected.emit(option);
  }

  onManualPolicyAdd() {
    // Create a new object for selectedOption to avoid direct mutation
    // and to resolve the translation for display purposes.
    this.selectedOption = {
      title: this.translate.instant(this.manualAddOption.title),
      code: this.manualAddOption.code,
      agreed: this.manualAddOption.agreed
    };
    this.isOpen = false;
    this.selected.emit(this.selectedOption); // Emit this special option
    this.manualPolicyAdd.emit(); // Also emit the original event for specific parent handling
  }
}