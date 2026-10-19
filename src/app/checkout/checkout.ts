import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ToastService } from '../shared/toast/toast.service';
import { ImgFallback } from '../shared/img-fallback.directive';
import { InrPipe } from '../shared/inr.pipe';
import { CITY_PATTERN, MOBILE_PATTERN, NAME_PATTERN, PINCODE_PATTERN } from '../shared/validators';

type FieldName = 'fullName' | 'mobile' | 'address' | 'city' | 'state' | 'pincode';

const MESSAGES: Record<FieldName, Record<string, string>> = {
  fullName: {
    required: "Enter the receiver's full name.",
    pattern: 'Use 3 to 30 letters and spaces only.',
  },
  mobile: {
    required: 'Enter a mobile number.',
    pattern: 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
  },
  address: {
    required: 'Enter the delivery address.',
    minlength: 'Address must be at least 10 characters.',
    maxlength: 'Address can be at most 200 characters.',
  },
  city: { required: 'Enter your city.', pattern: 'Enter a valid city name.' },
  state: { required: 'Select your state.' },
  pincode: { required: 'Enter your PIN code.', pattern: 'Enter a 6-digit PIN code.' },
};

const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, ImgFallback, InrPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private fb = inject(NonNullableFormBuilder);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private router = inject(Router);
  private orders = inject(OrderService);
  private toast = inject(ToastService);
  cart = inject(CartService);

  states = STATES;
  submitted = signal(false);
  saveFailed = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    mobile: ['', [Validators.required, Validators.pattern(MOBILE_PATTERN)]],
    address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.pattern(CITY_PATTERN)]],
    state: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(PINCODE_PATTERN)]],
  });

  errorMessage(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    const rules = MESSAGES[name];
    const key = Object.keys(control.errors).find((k) => k in rules);
    return key ? rules[key] : null;
  }

  placeOrder() {
    this.submitted.set(true);
    this.saveFailed.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')
        ?.focus();
      return;
    }

    const order = this.orders.place(this.form.getRawValue());
    if (!order) {
      // Nothing was saved and the cart is untouched, so we do not pretend it worked.
      this.saveFailed.set(true);
      return;
    }

    this.toast.show('Demo order ' + order.id + ' recorded.', 'success');
    this.router.navigate(['/order-confirmation', order.id]);
  }
}
