import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { Contact } from './contact';

const VALID = {
  name: 'Dhanush Kumar',
  email: 'dhanush@example.com',
  subject: 'Feedback',
  message: 'The catalogue looks great and loads quickly.',
};

describe('Contact page', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('shows an error for every empty field on submit', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/contact', Contact);

    page.submit();
    harness.detectChanges();

    expect(harness.routeNativeElement!.querySelectorAll('.field-error').length).toBe(4);
    expect(page.checked()).toBe(false);
  });

  it('validates email and message length', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/contact', Contact);

    page.form.patchValue({ ...VALID, email: 'nope' });
    expect(page.form.controls.email.hasError('pattern')).toBe(true);

    page.form.patchValue({ ...VALID, message: 'short' });
    expect(page.form.controls.message.hasError('minlength')).toBe(true);

    page.form.patchValue({ ...VALID, message: 'x'.repeat(501) });
    expect(page.form.controls.message.hasError('maxlength')).toBe(true);
  });

  it('with valid input says the message was NOT sent, clears the form and stores nothing', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/contact', Contact);

    page.form.setValue(VALID);
    page.submit();
    harness.detectChanges();

    expect(page.checked()).toBe(true);
    expect(harness.routeNativeElement!.textContent).toContain('not');
    expect(harness.routeNativeElement!.textContent).toContain('sent anywhere');
    expect(page.form.getRawValue().message).toBe('');
    expect(localStorage.length).toBe(0);
  });
});
