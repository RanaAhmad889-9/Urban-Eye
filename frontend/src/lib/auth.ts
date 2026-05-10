export interface User { id: string; name: string; email: string; role: 'USER' | 'ADMIN'; }
export const getUser = (): User | null => { try { const r = typeof window !== 'undefined' ? localStorage.getItem('user') : null; return r ? JSON.parse(r) : null; } catch { return null; } };
export const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const setAuth = (token: string, user: User) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); };
export const clearAuth = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); };
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUser()?.role === 'ADMIN';
