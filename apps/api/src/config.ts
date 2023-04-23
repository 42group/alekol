import { LinkableService } from '@alekol/shared/enums';

export default () => ({
  cache: {
    host: `${process.env.CACHE_HOST}`,
    port: parseInt(`${process.env.CACHE_PORT}`),
  },
  [LinkableService.Discord]: {
    api: {
      baseUrl: 'https://discord.com/api/v10',
      clientId: process.env.DISCORD_API_CLIENT_ID,
      clientSecret: process.env.DISCORD_API_CLIENT_SECRET,
      redirectUri: `${process.env.FRONTEND_BASE_URL}/auth/oauth2/${LinkableService.Discord}/callback`,
    },
  },
  [LinkableService.Ft]: {
    api: {
      baseUrl: 'https://api.intra.42.fr/v2',
      clientId: process.env.FT_API_CLIENT_ID,
      clientSecret: process.env.FT_API_CLIENT_SECRET,
      redirectUri: `${process.env.FRONTEND_BASE_URL}/auth/oauth2/${LinkableService.Ft}/callback`,
    },
    cookies: {
      userId: process.env.FT_USER_ID_COOKIE,
    },
    user: {
      id: process.env.FT_USER_ID,
    },
    websocket: {
      connectionConfig: {
        protocolVersion: 13,
        perMessageDeflate: true,
        headers: {
          Origin: 'https://meta.intra.42.fr',
          Cookie: `user.id=${process.env.FT_USER_ID_COOKIE};`,
        },
      },
      protocols: ['actioncable-v1-json', 'actioncable-unsupported'],
      url: 'wss://profile.intra.42.fr/cable',
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
