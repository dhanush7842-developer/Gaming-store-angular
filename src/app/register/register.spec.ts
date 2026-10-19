import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Register } from './register';

const VALID = {
  fullName: 'Dhanush Kumar',
  email: 'dhanush@example.com',
  password: 'Gaming123',
  confirmPassword: 'Gaming123',
  mobile: '9876543210',
  dob: '2003-05-20',
  gender: 'Male',
  platform: 'PC',
  address: '12 Main Street, Hyderabad',
  terms: true,
};

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accepts a fully valid form', () => {
    component.form.setValue(VALID);
    expect(component.form.valid).toBe(true);
  });

  it('shows an error for every required field when submitted empty', () => {
    component.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(10);
    expect(fixture.nativeElement.textContent).toContain('Please fix the highlighted fields');
    expect(component.checked()).toBe(false);
  });

  it('validates the email format', () => {
    component.form.patchValue({ ...VALID, email: 'not-an-email' });
    expect(component.form.controls.email.hasError('pattern')).toBe(true);
  });

  it('validates the mobile number (10 digits starting with 6-9)', () => {
    for (const bad of ['12345', '1234567890', '98765abcde', '98765432101']) {
      component.form.patchValue({ ...VALID, mobile: bad });
      expect(component.form.controls.mobile.valid).toBe(false);
    }
    component.form.patchValue({ ...VALID, mobile: '6000000000' });
    expect(component.form.controls.mobile.valid).toBe(true);
  });

  it('requires a password of 8+ characters with a letter and a number', () => {
    component.form.patchValue({ ...VALID, password: 'short1', confirmPassword: 'short1' });
    expect(component.form.controls.password.hasError('minlength')).toBe(true);

    component.form.patchValue({
      ...VALID,
      password: 'onlyletters',
      confirmPassword: 'onlyletters',
    });
    expect(component.form.controls.password.hasError('pattern')).toBe(true);

    component.form.patchValue({ ...VALID, password: '12345678', confirmPassword: '12345678' });
    expect(component.form.controls.password.hasError('pattern')).toBe(true);
  });

  it('detects mismatching passwords', () => {
    component.form.patchValue({ ...VALID, confirmPassword: 'Different123' });
    expect(component.form.hasError('passwordMismatch')).toBe(true);

    component.form.controls.confirmPassword.markAsTouched();
    expect(component.errorMessage('confirmPassword')).toBe('Passwords do not match.');
  });

  it('rejects a future date of birth and users under 13', () => {
    const nextYear = new Date().getFullYear() + 1;
    component.form.patchValue({ ...VALID, dob: nextYear + '-01-01' });
    expect(component.form.controls.dob.hasError('futureDate')).toBe(true);

    const tooYoung = new Date().getFullYear() - 10;
    component.form.patchValue({ ...VALID, dob: tooYoung + '-01-01' });
    expect(component.form.controls.dob.hasError('minAge')).toBe(true);
  });

  it('requires the terms checkbox', () => {
    component.form.patchValue({ ...VALID, terms: false });
    component.form.controls.terms.markAsTouched();
    expect(component.errorMessage('terms')).toBe('You must agree to continue.');
  });

  it('with valid input shows the demo notice, clears everything and stores nothing', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.form.setValue(VALID);
    component.submit();
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No account was created');
    expect(component.form.getRawValue().password).toBe('');
    expect(component.form.getRawValue().fullName).toBe('');
    expect(localStorage.length).toBe(0);
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
