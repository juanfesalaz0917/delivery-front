import {
  type ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './core/store/auth.reducer';
import { AuthEffects } from './core/store/auth.effect';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import {
  provideAuth,
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';
import { environment } from './environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideFirebaseApp(() => initializeApp(environment.oauth.firebase)),
    provideAnalytics(() => {
      if (typeof window === 'undefined') return undefined as any;
      try {
        return getAnalytics();
      } catch {
        return undefined as any;
      }
    }),
    provideAuth(() => {
      const auth = getAuth();
      setPersistence(auth, browserLocalPersistence).catch(() => {});
      return auth;
    }),
  ],
};
