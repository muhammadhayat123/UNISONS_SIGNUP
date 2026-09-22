export interface StoredUser {
  id: number;
  username: string;
  email: string;
  designation: 'admin' | 'seller';
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAdmin(): boolean {
  return getStoredUser()?.designation === 'admin';
}

export function isSeller(): boolean {
  return getStoredUser()?.designation === 'seller';
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
