import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { GamingStore } from './gaming-store/gaming-store';
import { NotFound } from './not-found/not-found';

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('redirects the root to the home page and shows the 404 page for unknown paths', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/', Home);
    await harness.navigateByUrl('/unknown-page', NotFound);
  });

  it('resolves each named page', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/home', Home);
    await harness.navigateByUrl('/login', Login);
    await harness.navigateByUrl('/register', Register);
    await harness.navigateByUrl('/catalogue', GamingStore);
  });
});
