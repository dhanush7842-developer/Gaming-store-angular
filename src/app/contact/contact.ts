import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMAIL_PATTERN, NAME_PATTERN } from '../shared/validators';

type FieldName = 'name' | 'email' | 'subject' | 'message';

const MESSAGES: Record<FieldName, Record<string, string>> = {
  name: { required: 'Enter your name.', pattern: 'Use 3 to 30 letters and spaces only.' },
  email: {
    required: 'Enter your email address.',
    pattern: 'Enter a valid email, for example name@example.com.',
  },
  subject: { required: 'Choose a subject.' },
  message: {
    required: 'Write a message.',
    minlength: 'Message must be at least 10 characters.',
    maxlength: 'Message can be at most 500 characters.',
  },
};

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private fb = inject(NonNullableFormBuilder);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  subjects = ['General question', 'Order help', 'Feedback', 'Other'];
  submitted = signal(false);
  checked = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  errorMessage(name: FieldName): string | null {
    const control = this.form.controls[name];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    const rules = MESSAGES[name];
    const key = Object.keys(control.errors).find((k) => k in rules);
    return key ? rules[key] : null;
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

    // There is no server or inbox behind this form, so the message is NOT sent anywhere.
    this.checked.set(true);
    this.form.reset();
    this.submitted.set(false);
  }
}
