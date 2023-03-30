export function generateDiscordOauth2Url(
  clientId: string,
  redirectUri: string
) {
  const encodedClientId = encodeURIComponent(clientId);
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const url = `https://discord.com/api/oauth2/authorize?client_id=${encodedClientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=identify`;

  return url;
}
