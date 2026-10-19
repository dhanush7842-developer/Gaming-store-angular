import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(NonNullableFormBuilder);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  showPassword = signal(false);
  submitted = signal(false); // true after the user pressed Login once
  checked = signal(false); // true after a valid submit (shows the demo notice)

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required]],
  });

  /** Returns the error text to show under a field, or null if there is none. */
  errorMessage(name: 'username' | 'password'): string | null {
    const control = this.form.controls[name];
    if (!control.errors || !(control.touched || this.submitted())) return null;

    if (control.hasError('required')) {
      return name === 'username' ? 'Enter your username or email.' : 'Enter your password.';
    }
    if (control.hasError('minlength')) return 'Username must be at least 3 characters.';
    return null;
  }

  submit() {
    this.submitted.set(true);
    this.checked.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
      return;
    }

    // There is no backend yet, so nobody can be logged in.
    // We only confirm the form is valid, then discard what was typed (never keep passwords).
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
