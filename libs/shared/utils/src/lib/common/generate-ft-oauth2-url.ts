import { getRandomStateFromSessionStorage } from './get-random-state-from-session-storage';

export function generateFtOauth2Url(clientId: string, redirectUri: string) {
  const encodedClientId = encodeURIComponent(clientId);
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const state = getRandomStateFromSessionStorage();
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=${encodedClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=public&state=${state}`;

  return url;
}
