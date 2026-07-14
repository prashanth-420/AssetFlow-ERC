const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let googleScriptPromise;

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Google sign-in script.')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Google sign-in script.'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export async function requestGoogleAccessToken() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID in the frontend environment.');
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (response) => {
        if (response?.error) {
          reject(new Error(response.error_description || response.error || 'Google sign-in failed.'));
          return;
        }

        if (!response?.access_token) {
          reject(new Error('Google did not return an access token.'));
          return;
        }

        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}