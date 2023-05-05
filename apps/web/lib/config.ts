import { LinkableService } from '@alekol/shared/enums';

if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID)
  console.warn(
    "'NEXT_PUBLIC_DISCORD_CLIENT_ID' environment variable must be defined"
  );
if (!process.env.NEXT_PUBLIC_BASE_URL)
  console.warn("'NEXT_PUBLIC_BASE_URL' environment variable must be defined");

const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  discord: {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth2/${LinkableService.Discord}/callback`,
  },
  ft: {
    clientId: process.env.NEXT_PUBLIC_FT_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth2/${LinkableService.Ft}/callback`,
  },
  ironSession: {
    cookieName: 'alekol_session',
    password: process.env.SESSION_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
};

export default config;
