import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { NotFound } from './not-found';

describe('404 page', () => {
  it('is shown for unknown addresses and links back to safe pages', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/this/does/not/exist', NotFound);
    harness.detectChanges();

    const element = harness.routeNativeElement!;
    expect(element.textContent).toContain('Page not found');
    expect(element.querySelector('a[href="/home"]')).not.toBeNull();
    expect(element.querySelector('a[href="/catalogue"]')).not.toBeNull();
  });
});
