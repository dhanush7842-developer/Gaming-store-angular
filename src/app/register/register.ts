import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  EMAIL_PATTERN,
  MOBILE_PATTERN,
  NAME_PATTERN,
  PASSWORD_PATTERN,
  minAgeValidator,
  passwordsMatch,
} from '../shared/validators';

type FieldName =
  | 'fullName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'mobile'
  | 'dob'
  | 'gender'
  | 'platform'
  | 'address'
  | 'terms';

/** The error text for each rule, per field. The first matching rule is shown. */
const MESSAGES: Record<FieldName, Record<string, string>> = {
  fullName: {
    required: 'Enter your full name.',
    pattern: 'Use 3 to 30 letters and spaces only.',
  },
  email: {
    required: 'Enter your email address.',
    pattern: 'Enter a valid email, for example name@example.com.',
  },
  password: {
    required: 'Create a password.',
    minlength: 'Password must be at least 8 characters.',
    pattern: 'Password must include at least one letter and one number.',
  },
  confirmPassword: {
    required: 'Re-enter your password.',
  },
  mobile: {
    required: 'Enter your mobile number.',
    pattern: 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
  },
  dob: {
    required: 'Select your date of birth.',
    invalidDate: 'Enter a valid date.',
    futureDate: 'Date of birth cannot be in the future.',
    minAge: 'You must be at least 13 years old.',
  },
  gender: { required: 'Select an option.' },
  platform: { required: 'Choose your main gaming platform.' },
  address: {
    required: 'Enter your address.',
    minlength: 'Address must be at least 10 characters.',
    maxlength: 'Address can be at most 200 characters.',
  },
  terms: { required: 'You must agree to continue.' },
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(NonNullableFormBuilder);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  genders = ['Male', 'Female', 'Other'];
  platforms = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'];

  showPassword = signal(false);
  submitted = signal(false); // true after the user pressed Register once
  checked = signal(false); // true after a valid submit (shows the demo notice)

  /** Latest selectable birth date (today), in the yyyy-mm-dd format the date input needs. */
  maxDob = new Date().toISOString().split('T')[0];

  form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)],
      ],
      confirmPassword: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(MOBILE_PATTERN)]],
      dob: ['', [Validators.required, minAgeValidator(13)]],
      gender: ['', [Validators.required]],
      platform: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      terms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  /** Returns the error text to show under a field, or null if there is none. */
  errorMessage(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!(control.touched || this.submitted())) return null;

    if (control.errors) {
      const rules = MESSAGES[name];
      const key = Object.keys(control.errors).find((k) => k in rules);
      return key ? rules[key] : null;
    }

    if (name === 'confirmPassword' && this.form.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }
    return null;
  }

  submit() {
    this.submitted.set(true);
    this.checked.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement
        .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid')
        ?.focus();
      return;
    }

    // There is no backend yet, so no account can be created.
    // We only confirm the form is valid, then discard everything (never keep passwords).
    this.checked.set(true);
    this.form.reset();
    this.submitted.set(false);
  }

  clear() {
    this.form.reset();
    this.submitted.set(false);
    this.checked.set(false);
  }
}
