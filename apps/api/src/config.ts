import { LinkableService } from '@alekol/shared/enums';

export default () => ({
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
  },
  ironSession: {
    cookieName: 'alekol_session',
    password: process.env.SESSION_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});
