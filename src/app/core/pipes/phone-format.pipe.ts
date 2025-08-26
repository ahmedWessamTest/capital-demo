import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  pure:true
})
export class PhoneFormatPipe  implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';
    let cleaned = value.replace(/^0/,'+20').replace(/-/g,'')
    console.log(cleaned)
    
    return cleaned;
  }

}
