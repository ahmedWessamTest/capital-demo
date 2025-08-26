import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonEngine } from '@angular/ssr/node';
import { FormErrorDirective } from '../../directives/form-error.directive';
import { GovernorateOption, PolicyDropDownComponent } from "../policy-drop-down/policy-drop-down.component";

@Component({
  selector: 'app-test-form',
  imports: [CommonModule, FormErrorDirective, PolicyDropDownComponent,ReactiveFormsModule,FormsModule],
  templateUrl: './test-form.component.html',
  styleUrl: './test-form.component.css'
})
export class TestFormComponent implements OnInit{

  // بيانات المحافظات
  governorates: GovernorateOption[] = [
    { id: 1, name: 'القاهرة', code: 'CAI' },
    { id: 2, name: 'الجيزة', code: 'GIZ' },
    { id: 3, name: 'الإسكندرية', code: 'ALX' },
    { id: 4, name: 'الدقهلية', code: 'DAK' },
    { id: 5, name: 'الشرقية', code: 'SHR' },
    { id: 6, name: 'القليوبية', code: 'QAL' },
    { id: 7, name: 'كفر الشيخ', code: 'KFS' },
    { id: 8, name: 'الغربية', code: 'GHR' },
    { id: 9, name: 'المنوفية', code: 'MNF' },
    { id: 10, name: 'البحيرة', code: 'BHR' },
    { id: 11, name: 'بني سويف', code: 'BNS' },
    { id: 12, name: 'الفيوم', code: 'FYM' }
  ];

  // بيانات أنواع السيارات
  carTypes: GovernorateOption[] = [
    { id: 1, name: 'تويوتا كورولا', code: 'TOY_COR' },
    { id: 2, name: 'هيونداي إلنترا', code: 'HYU_ELA' },
    { id: 3, name: 'نيسان صني', code: 'NIS_SUN' },
    { id: 4, name: 'شيفروليه أوبترا', code: 'CHE_OPT' },
    { id: 5, name: 'كيا سيراتو', code: 'KIA_CER' },
    { id: 6, name: 'هوندا سيفيك', code: 'HON_CIV' },
    { id: 7, name: 'فولكس واجن جيتا', code: 'VOL_JET' },
    { id: 8, name: 'بيجو 301', code: 'PEU_301' },
    { id: 9, name: 'رينو لوجان', code: 'REN_LOG' },
    { id: 10, name: 'فيات تيبو', code: 'FIA_TIP' },
    { id: 11, name: 'سكودا أوكتافيا', code: 'SKO_OCT' },
    { id: 12, name: 'مازدا 3', code: 'MAZ_3' },
    { id: 1, name: 'تويوتا كورولا', code: 'TOY_COR' },
    { id: 2, name: 'هيونداي إلنترا', code: 'HYU_ELA' },
    { id: 3, name: 'نيسان صني', code: 'NIS_SUN' },
    { id: 4, name: 'شيفروليه أوبترا', code: 'CHE_OPT' },
    { id: 5, name: 'كيا سيراتو', code: 'KIA_CER' },
    { id: 6, name: 'هوندا سيفيك', code: 'HON_CIV' },
    { id: 7, name: 'فولكس واجن جيتا', code: 'VOL_JET' },
    { id: 8, name: 'بيجو 301', code: 'PEU_301' },
    { id: 9, name: 'رينو لوجان', code: 'REN_LOG' },
    { id: 10, name: 'فيات تيبو', code: 'FIA_TIP' },
    { id: 11, name: 'سكودا أوكتافيا', code: 'SKO_OCT' },
    { id: 12, name: 'مازدا 3', code: 'MAZ_3' }
  ];

  // القيم المختارة
  selectedGovernorate: GovernorateOption | null = null;
  selectedCarType: GovernorateOption | null = null;

  // حالة الأخطاء
  governorateError: string = '';
  carTypeError: string = '';

  // حالة التحميل
  isLoading: boolean = false;
selectedOption: any;

  ngOnInit() {
    // يمكن تحميل البيانات من API هنا
  }

  onGovernorateSelected(governorate: GovernorateOption) {
    // التحقق من وجود بيانات (في حالة المسح)
    if (governorate && Object.keys(governorate).length > 0) {
      this.selectedGovernorate = governorate;
      this.governorateError = ''; // مسح الخطأ عند الاختيار
      console.log('Selected Governorate:', governorate);
    } else {
      this.selectedGovernorate = null;
    }
  }

  onCarTypeSelected(carType: GovernorateOption) {
    // التحقق من وجود بيانات (في حالة المسح)
    if (carType && Object.keys(carType).length > 0) {
      this.selectedCarType = carType;
      this.carTypeError = ''; // مسح الخطأ عند الاختيار
      console.log('Selected Car Type:', carType);
    } else {
      this.selectedCarType = null;
    }
  }

  validateForm(): boolean {
    let isValid = true;

    // التحقق من اختيار المحافظة
    if (!this.selectedGovernorate) {
      this.governorateError = 'يرجى اختيار المحافظة';
      isValid = false;
    } else {
      this.governorateError = '';
    }

    // التحقق من اختيار نوع السيارة
    if (!this.selectedCarType) {
      this.carTypeError = 'يرجى اختيار نوع السيارة';
      isValid = false;
    } else {
      this.carTypeError = '';
    }

    return isValid;
  }

  onSave() {
    if (this.validateForm()) {
      this.isLoading = true;
      
      // محاكاة عملية الحفظ
      const formData = {
        governorate: this.selectedGovernorate,
        carType: this.selectedCarType,
        timestamp: new Date()
      };

      console.log('Saving data:', formData);

      // محاكاة API call
      setTimeout(() => {
        this.isLoading = false;
        alert('تم الحفظ بنجاح!');
        
        // يمكن إعادة تعيين النموذج هنا إذا أردت
        // this.resetForm();
      }, 2000);
    } else {
      console.log('Form validation failed');
    }
  }

  onReset() {
    this.selectedGovernorate = null;
    this.selectedCarType = null;
    this.governorateError = '';
    this.carTypeError = '';
    console.log('Form reset');
  }

  resetForm() {
    this.onReset();
  }

  // للتحقق من صحة النموذج
  get isFormValid(): boolean {
    return this.selectedGovernorate !== null && this.selectedCarType !== null;
  }

  // للحصول على ملخص الاختيارات
  get selectionSummary(): string {
    if (this.isFormValid) {
      return `المحافظة: ${this.selectedGovernorate?.name} | نوع السيارة: ${this.selectedCarType?.name}`;
    }
    return 'لم يتم اختيار البيانات بعد';
  }


  selections = [
    { value: '' },
    { value: 'Electricity' },
    { value: 'Gasoline' }
  ];

  onSelect(index: number, selectedValue: string) {
    this.selections[index].value = selectedValue;
  }


  isSelected = false;

  toggleSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    this.isSelected = input.checked;
  }
}
