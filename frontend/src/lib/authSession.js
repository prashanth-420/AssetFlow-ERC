const AUTH_TOKEN_KEY = 'af_auth_token';
const AUTH_USER_KEY = 'af_logged_in_user';
const AUTH_ROLE_KEY = 'af_user_role';
const AUTH_EMAIL_KEY = 'af_user_email';

export function saveAuthSession(payload) {
  localStorage.setItem(AUTH_TOKEN_KEY, payload.token || '');
  localStorage.setItem(AUTH_USER_KEY, payload.displayName || payload.email || 'Employee');
  localStorage.setItem(AUTH_ROLE_KEY, payload.role || 'EMPLOYEE');
  localStorage.setItem(AUTH_EMAIL_KEY, payload.email || '');
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

export function hasAuthSession() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export function getAuthRole() {
  return localStorage.getItem(AUTH_ROLE_KEY) || 'EMPLOYEE';
}

export function getAuthUserName() {
  return localStorage.getItem(AUTH_USER_KEY) || 'Guest';
}