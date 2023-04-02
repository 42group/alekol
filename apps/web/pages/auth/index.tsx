import { withIronSessionSsr } from 'iron-session/next';
import { User } from '@alekol/shared/interfaces';
import { AuthForm } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import config from '../../lib/config';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(),
  config.ironSession
);

export interface AuthProps {
  user?: User;
}

export function Auth({ user }: AuthProps) {
  if (!user) return null;

  const servicesConfig = {
    discord: {
      clientId: config.discord.clientId,
      redirectUri: config.discord.redirectUri,
      user: user.accountLinking.discord,
    },
    ft: {
      clientId: config.ft.clientId,
      redirectUri: config.ft.redirectUri,
      user: user.accountLinking.ft,
    },
  };

  return <AuthForm servicesConfig={servicesConfig} />;
}

export default Auth;
