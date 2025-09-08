import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface LeadTypeOption {
  value: string;
  translationKey: string;
}

export interface LeadTypeConfig {
  title?: string;
  subtitle?: string;
  description?: string;
  nextButtonText?: string;
  options: LeadTypeOption[];
}
@Component({
  selector: 'app-lead-type-selector',
  imports: [TranslatePipe,CommonModule],
  templateUrl: './lead-type-selector.component.html',
  styleUrl: './lead-type-selector.component.css'
})
export class LeadTypeSelectorComponent {
@Input() config!: LeadTypeConfig;
  @Input() selectedValue: string | null = null;
  @Input() disabled: boolean = false;
  @Input() componentId: string = 'lead-type-choice';
  @Input() radioGroupName: string = 'leadType';

  @Output() selectionChange = new EventEmitter<string>();
  @Output() nextClick = new EventEmitter<string>();
   onSelectionChange(value: string): void {
    this.selectedValue = value;
    this.selectionChange.emit(value);
  }

  onNextClick(): void {
    if (this.selectedValue) {
      this.nextClick.emit(this.selectedValue);
    }
  }

  trackByValue(index: number, option: LeadTypeOption): string {
    return option.value;
  }
}
