if (!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID)
  throw "'NEXT_PUBLIC_DISCORD_CLIENT_ID' environment variable must be defined";
if (!process.env.NEXT_PUBLIC_BASE_URL)
  throw "'NEXT_PUBLIC_BASE_URL' environment variable must be defined";

const config = {
  discord: {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth2/discord/callback`,
  },
};

export default config;
