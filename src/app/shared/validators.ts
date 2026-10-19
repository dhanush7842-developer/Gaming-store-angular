import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Letters and spaces only, 3 to 30 characters, at least one letter. */
export const NAME_PATTERN = /^(?=.*[A-Za-z])[A-Za-z ]{3,30}$/;

/** Simple email shape check: something@something.tld */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobile number: 10 digits starting with 6, 7, 8 or 9. */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/** At least one letter and one number. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

/** Date of birth must not be in the future and must be at least `minYears` years ago. */
export function minAgeValidator(minYears: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null; // "required" handles empty values

    const dob = new Date(value + 'T00:00:00');
    if (isNaN(dob.getTime())) return { invalidDate: true };

    const today = new Date();
    if (dob > today) return { futureDate: true };

    const cutoff = new Date(today.getFullYear() - minYears, today.getMonth(), today.getDate());
    return dob <= cutoff ? null : { minAge: { required: minYears } };
  };
}

/** Form-level check: password and confirmPassword must be equal. */
export const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
};

/** City name: letters, spaces and a few punctuation marks, 2 to 40 characters. */
export const CITY_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,39}$/;

/** Indian PIN code: 6 digits, not starting with 0. */
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;
