import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../models';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state: AuthState) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    AuthActions.loginSuccess,
    (state: AuthState, { user, token }: { user: User; token: string }) => ({
      ...state,
      user,
      token,
      loading: false,
      error: null,
    }),
  ),

  on(
    AuthActions.loginFailure,
    (state: AuthState, { error }: { error: string }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  on(AuthActions.logout, (state: AuthState) => ({ ...initialState })),
);
