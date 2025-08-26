import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-heading',
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  styleUrl: './heading.component.css'
})
export class HeadingComponent {
  @Input() className: string = '';
 /**
   * The main text content for the heading.
   */
 @Input() headingText: string = '';

 /**
  * Determines if the SVG icons should be displayed on the start (left in LTR, right in RTL) side.
  * Defaults to true to match original behavior.
  */
 @Input() showStartSvg: boolean = true;

 /**
  * Determines if the SVG icons should be displayed on the end (right in LTR, left in RTL) side.
  * Defaults to true to match original behavior.
  */
 @Input() showEndSvg: boolean = true;
}
