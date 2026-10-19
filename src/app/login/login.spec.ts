import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows validation messages when submitted empty', () => {
    component.submit();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Enter your username or email.');
    expect(text).toContain('Enter your password.');
    expect(component.checked()).toBe(false);
  });

  it('rejects a username shorter than 3 characters', () => {
    component.form.patchValue({ username: 'ab', password: 'secret1' });
    component.submit();
    expect(component.form.invalid).toBe(true);
    expect(component.errorMessage('username')).toContain('at least 3');
  });

  it('with valid input only shows the demo notice, clears the form and saves nothing', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.form.patchValue({ username: 'dhanush', password: 'secret1' });
    component.submit();
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('not');
    expect(component.form.getRawValue().password).toBe('');
    expect(localStorage.length).toBe(0);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#password');
    expect(input.type).toBe('password');

    component.showPassword.set(true);
    fixture.detectChanges();
    expect(input.type).toBe('text');
  });
});
