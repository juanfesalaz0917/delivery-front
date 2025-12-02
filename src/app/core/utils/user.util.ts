import { User } from '../models';

export function getUser(): User | null {
  try {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('user')
        : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const user: User = {
      id: parsed.id ?? parsed.uid ?? null,
      name: parsed.name ?? parsed.displayName ?? parsed.nombre ?? null,
      email: parsed.email ?? null,
      photoUrl: parsed.photoUrl ?? parsed.photoURL ?? parsed.foto ?? null,
    };
    return user;
  } catch (e) {
    return null;
  }
}
