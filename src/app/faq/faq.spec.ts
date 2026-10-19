import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { Faq } from './faq';

describe('FAQ page', () => {
  it('lists the questions as accessible expandable items and links to Contact', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/faq', Faq);
    harness.detectChanges();

    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('details').length).toBe(8);
    expect(element.querySelectorAll('summary').length).toBe(8);
    expect(element.textContent).toContain('Do you collect my card or payment details?');
    expect(element.querySelector('a[href="/contact"]')).not.toBeNull();
  });
});
