// policy-drop-down.component.ts
import { Component, EventEmitter, Input, Output, ElementRef, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface GovernorateOption {
  id: string | number;
  name: string;
  code?: string;
  en_name?: string;
  ar_name?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-policy-drop-down',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './policy-drop-down.component.html',
  styleUrls: ['./policy-drop-down.component.css']
})
export class PolicyDropDownComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Select Option';
  @Input() governorates: GovernorateOption[] = [];
  @Input() displayProperty: string = 'name';
  @Input() valueProperty: string = 'id';
  @Input() selectedValue: any = null;
  @Input() showError: boolean = false;
  @Output() selected = new EventEmitter<GovernorateOption>();
  @Output() focused = new EventEmitter<void>(); // New event for focus

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  filteredGovernorates: GovernorateOption[] = [];
  selectedGovernorate: GovernorateOption | null = null;
  isDropdownOpen = false;
  searchValue = '';

  constructor(
    private elementRef: ElementRef,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['governorates']) {
      this.initializeData();
    }
    if (changes['selectedValue'] && this.selectedValue) {
      this.setSelectedValue(this.selectedValue);
    }
  }

  private initializeData() {
    if (this.governorates && this.governorates.length > 0) {
      this.filteredGovernorates = [...this.governorates];
      if (this.selectedValue) {
        this.setSelectedValue(this.selectedValue);
      }
    } else {
      this.filteredGovernorates = [];
    }
  }

  private setSelectedValue(value: any) {
    const selected = this.governorates.find(gov =>
      gov[this.valueProperty] === value ||
      gov.id === value ||
      gov === value
    );
    if (selected) {
      this.selectedGovernorate = selected;
      this.searchValue = this.getDisplayValue(selected);
    }
  }

  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      if (!this.selectedGovernorate && this.searchValue) {
        this.searchValue = '';
      }
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    this.isDropdownOpen = false;
    if (!this.selectedGovernorate && this.searchValue) {
      this.searchValue = '';
    }
  }

  onSelectedValueClick() {
    this.isDropdownOpen = true;
    this.filteredGovernorates = [...this.governorates];
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
        this.searchValue = '';
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filteredGovernorates = [...this.governorates];
      if (this.selectedGovernorate) {
        this.searchValue = '';
      }
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    }
  }

  onInputFocus() {
    this.focused.emit(); // Emit focus event
    this.isDropdownOpen = true;
    if (!this.searchValue || this.selectedGovernorate) {
      this.filteredGovernorates = [...this.governorates];
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchValue = input.value;
    if (!this.searchValue) {
      this.selectedGovernorate = null;
    }
    this.filteredGovernorates = this.governorates.filter(gov =>
      this.getDisplayValue(gov).toLowerCase().includes(this.searchValue.toLowerCase())
    );
    this.isDropdownOpen = true;
  }

  selectGovernorate(governorate: GovernorateOption) {
    this.selectedGovernorate = governorate;
    this.searchValue = this.getDisplayValue(governorate);
    this.selected.emit(governorate);
    this.isDropdownOpen = false;
  }

  clearSelection() {
    this.selectedGovernorate = null;
    this.searchValue = '';
    this.filteredGovernorates = [...this.governorates];
    this.selected.emit({} as GovernorateOption);
    this.isDropdownOpen = false;
  }

  getDisplayValue(governorate: GovernorateOption): string {
    return this.translate.currentLang === 'ar'
      ? governorate.ar_name || governorate.name
      : governorate.en_name || governorate.name;
  }

  getSelectedDisplayValue(): string {
    return this.searchValue;
  }

  isSelected(governorate: GovernorateOption): boolean {
    return this.selectedGovernorate?.[this.valueProperty] === governorate[this.valueProperty];
  }

  getButtonClasses(governorate: GovernorateOption): string {
    const baseClasses = 'px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300';
    return this.isSelected(governorate)
      ? `${baseClasses} bg-blue-500 text-white border-blue-500 shadow-md`
      : `${baseClasses} bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300`;
  }

  get hasData(): boolean {
    return this.governorates && this.governorates.length > 0;
  }

  trackByFn(index: number, item: GovernorateOption): any {
    return item[this.valueProperty] || item.id || index;
  }
}