import { withIronSessionSsr } from 'iron-session/next';
import { User } from '@alekol/shared/interfaces';
import { AuthForm } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import { useDiscordCodeExchange } from '@alekol/shared/hooks';
import config from '../../../../../lib/config';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(
    [
      ({ query }) => !!query.code,
      (_, { user }) => !user.accountLinking.discord,
    ],
    '/auth'
  ),
  config.ironSession
);

export interface DiscordOauth2CallbackProps {
  user?: User;
}

export function Callback({ user }: DiscordOauth2CallbackProps) {
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

  useDiscordCodeExchange();

  return <AuthForm servicesConfig={servicesConfig} loadingService="Discord" />;
}

export default Callback;
