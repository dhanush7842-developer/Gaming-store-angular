import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Usage: {{ 80000 | inr }}  ->  ₹80,000 */
@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(value: number): string {
    return formatter.format(value);
  }
}
