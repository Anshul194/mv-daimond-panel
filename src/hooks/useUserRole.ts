import { useMemo } from 'react';

export default function useUserRole(): string | null {
  return useMemo(() => {
    try {
      const d = localStorage.getItem('user');
      if (d) {
        const parsed = JSON.parse(d);
        return parsed?.role || null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }, []);
}

export function isVendorRole(): boolean {
  try {
    const d = localStorage.getItem('user');
    if (d) return JSON.parse(d).role === 'vendor';
  } catch (e) {}
  return false;
}
