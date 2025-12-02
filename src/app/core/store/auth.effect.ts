import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class AuthEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly authService: AuthService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(() =>
        this.authService.loginWithGoogle().pipe(
          map((result: any) => {
            const user = {
              id: result.user.uid,
              name: result.user.displayName || '',
              email: result.user.email || '',
              photoUrl: result.user.photoURL || '',
            };
            const token = result.user.refreshToken;
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(user));
                if (token) localStorage.setItem('token', token);
              }
            } catch (e) {}
            return AuthActions.loginSuccess({ user, token });
          }),
          catchError((err: any) =>
            of(
              AuthActions.loginFailure({
                error: err?.error ?? err?.message ?? String(err),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        map(() => {
          this.authService.logout();
        }),
      ),
    { dispatch: false },
  );
}
