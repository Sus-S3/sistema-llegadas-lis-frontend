const TOKEN_KEY = 'auth_token';

export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

export const getTokenPayload = (): Record<string, string> | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
