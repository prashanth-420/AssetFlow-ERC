const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

async function postAuth(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Unexpected response from the server.',
  }));

  return data;
}

export function loginRequest(payload) {
  return postAuth('/auth/login', payload);
}

export function signupRequest(payload) {
  return postAuth('/auth/signup', payload);
}

export function googleAuthRequest(payload) {
  return postAuth('/auth/google', payload);
}

export function sendOtpRequest(payload) {
  return postAuth('/auth/send-otp', payload);
}

export function verifyOtpRequest(payload) {
  return postAuth('/auth/verify-otp', payload);
}
