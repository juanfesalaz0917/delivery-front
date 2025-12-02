import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  type User,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { BehaviorSubject, filter, map, Observable, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth: Auth = inject(Auth);
  private readonly router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null | undefined>(
    undefined,
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  loginWithMicrosoft(): Observable<any> {
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
      tenant: 'common',
    });
    return new Observable((observer) => {
      signInWithPopup(this.auth, provider)
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return new Observable((observer) => {
      signInWithPopup(this.auth, provider)
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  loginWithGithub(): Observable<any> {
    const provider = new GithubAuthProvider();
    return new Observable((observer) => {
      signInWithPopup(this.auth, provider)
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      filter((v) => v !== undefined),
      take(1),
      map((user) => {
        if (user) {
          return true;
        }
        return false;
      }),
    );
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
