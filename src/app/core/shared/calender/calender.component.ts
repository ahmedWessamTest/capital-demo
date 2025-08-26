import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Day {
  day: number;
  inactive: boolean;
  active: boolean;
  highlight: boolean;
  inRange: boolean;
}

@Component({
  selector: 'app-calendar-input',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
  imports: [CommonModule],
  standalone: true,
  animations: [
    trigger('calendarAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(-10px)' })),
      transition(':enter', [animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))]),
    ]),
    trigger('pickerAnimation', [
      state('void', style({ opacity: 0, transform: 'scale(0.95)' })),
      transition(':enter', [animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))]),
    ]),
  ],
})
export class CalendarInputComponent implements OnInit {
  @Input() placeholder: string = 'Select Date';
  @Input() disabled: boolean = false;
  @Input() showError: boolean = false;
  @Input() initialDate: Date | null = null;
  @Output() dateSelected = new EventEmitter<Date>();

  @ViewChild('calendarInput') calendarInput!: ElementRef<HTMLInputElement>;

  showCalendar = false;
  showMonthPicker = false;
  showYearPicker = false;
  month: number = new Date().getMonth();
  year: number = new Date().getFullYear();
  daysInMonth: Day[] = [];
  yearsList: number[] = [];
  selectedDate: Date | null = null;
  displayValue: string = '';

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.initializeCalendar();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialDate'] && changes['initialDate'].currentValue) {
      this.selectedDate = new Date(changes['initialDate'].currentValue);
      this.month = this.selectedDate.getMonth();
      this.year = this.selectedDate.getFullYear();
      this.generateDaysInMonth();
      this.updateDisplayValue();
    }
  }

  private initializeCalendar(): void {
    this.generateYearsList();
    this.generateDaysInMonth();
    if (this.initialDate) {
      this.selectedDate = new Date(this.initialDate);
      this.month = this.selectedDate.getMonth();
      this.year = this.selectedDate.getFullYear();
      this.updateDisplayValue();
    }
  }

  private generateYearsList(): void {
    const currentYear = new Date().getFullYear();
    this.yearsList = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  }

  private generateDaysInMonth(): void {
    this.daysInMonth = [];
    const firstDay = new Date(this.year, this.month, 1).getDay();
    const lastDate = new Date(this.year, this.month + 1, 0).getDate();

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push({ day: 0, inactive: true, active: false, highlight: false, inRange: false });
    }

    // Current month days
    for (let day = 1; day <= lastDate; day++) {
      const isActive = this.selectedDate
        ? this.selectedDate.getDate() === day &&
          this.selectedDate.getMonth() === this.month &&
          this.selectedDate.getFullYear() === this.year
        : false;
      this.daysInMonth.push({ day, inactive: false, active: isActive, highlight: false, inRange: false });
    }

    // Next month days (fill remaining grid)
    const remainingDays = 42 - this.daysInMonth.length; // Ensure 6 rows
    for (let i = 1; i <= remainingDays; i++) {
      this.daysInMonth.push({ day: i, inactive: true, active: false, highlight: false, inRange: false });
    }
  }

  private updateDisplayValue(): void {
    if (this.selectedDate) {
      const day = this.selectedDate.getDate().toString().padStart(2, '0');
      const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = this.selectedDate.getFullYear().toString();
      this.displayValue = `${month}/${day}/${year}`;
    } else {
      this.displayValue = '';
    }
  }

  onInputClick(): void {
    if (!this.disabled) {
      this.showCalendar = !this.showCalendar;
      this.showMonthPicker = false;
      this.showYearPicker = false;
      if (this.showCalendar) {
        setTimeout(() => {
          this.calendarInput.nativeElement.focus();
        });
      }
    }
  }

  onDayClick(day: Day): void {
    if (!day.inactive) {
      this.selectedDate = new Date(this.year, this.month, day.day);
      this.generateDaysInMonth();
      this.updateDisplayValue();
      this.dateSelected.emit(this.selectedDate);
      this.showCalendar = false;
    }
  }

  onNavigationClick(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.month--;
      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }
    } else {
      this.month++;
      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }
    }
    this.generateDaysInMonth();
  }

  toggleMonthPicker(): void {
    this.showMonthPicker = !this.showMonthPicker;
    this.showYearPicker = false;
  }

  toggleYearPicker(): void {
    this.showYearPicker = !this.showYearPicker;
    this.showMonthPicker = false;
    if (this.showYearPicker) {
      setTimeout(() => {
        const yearElement = document.querySelector('.year-item.selected') as HTMLElement;
        if (yearElement) {
          yearElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  selectMonth(monthIndex: number): void {
    this.month = monthIndex;
    this.showMonthPicker = false;
    this.generateDaysInMonth();
  }

  selectYear(year: number): void {
    this.year = year;
    this.showYearPicker = false;
    this.generateDaysInMonth();
  }

  goToToday(): void {
    this.selectedDate = new Date();
    this.month = this.selectedDate.getMonth();
    this.year = this.selectedDate.getFullYear();
    this.generateDaysInMonth();
    this.updateDisplayValue();
    this.dateSelected.emit(this.selectedDate);
    this.showMonthPicker = false;
    this.showYearPicker = false;
    this.showCalendar = false;
  }

  clearSelection(): void {
    this.selectedDate = null;
    this.displayValue = '';
    this.generateDaysInMonth();
    this.dateSelected.emit(null as any);
    this.showCalendar = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showCalendar = false;
      this.showMonthPicker = false;
      this.showYearPicker = false;
    }
  }

  handleKeyDown(event: KeyboardEvent, day: Day): void {
    if (day.inactive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onDayClick(day);
    }
  }
}