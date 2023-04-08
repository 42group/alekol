//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.FRONTEND_BASE_URL,
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.DISCORD_API_CLIENT_ID,
    NEXT_PUBLIC_FT_CLIENT_ID: process.env.FT_API_CLIENT_ID,
    SESSION_PASSWORD: process.env.SESSION_PASSWORD,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/avatars/**',
      },
    ],
  },
};

module.exports = withNx(nextConfig);
