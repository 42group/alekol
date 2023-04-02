export default () => ({
  discord: {
    api: {
      baseUrl: 'https://discord.com/api/v10',
      clientId: process.env.DISCORD_API_CLIENT_ID,
      clientSecret: process.env.DISCORD_API_CLIENT_SECRET,
      redirectUri: `${process.env.FRONTEND_BASE_URL}/auth/oauth2/discord/callback`,
    },
  },
  ironSession: {
    cookieName: 'alekol_session',
    password: process.env.SESSION_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});
