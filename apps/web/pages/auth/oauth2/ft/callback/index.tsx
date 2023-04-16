import { withIronSessionSsr } from 'iron-session/next';
import { User } from '@alekol/shared/interfaces';
import { AuthForm } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import { useFtCodeExchange } from '@alekol/shared/hooks';
import config from '../../../../../lib/config';
import { LinkableService } from '@alekol/shared/enums';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(
    [({ query }) => !!query.code, (_, { user }) => !user.accountLinking.ft],
    '/auth'
  ),
  config.ironSession
);

export interface DiscordOauth2CallbackProps {
  user?: User;
}

export function Callback({ user }: DiscordOauth2CallbackProps) {
  const servicesConfig = {
    [LinkableService.Discord]: {
      clientId: config[LinkableService.Discord].clientId,
      redirectUri: config[LinkableService.Discord].redirectUri,
      user: user.accountLinking[LinkableService.Discord],
    },
    [LinkableService.Ft]: {
      clientId: config[LinkableService.Ft].clientId,
      redirectUri: config[LinkableService.Ft].redirectUri,
      user: user.accountLinking[LinkableService.Ft],
    },
  };

  useFtCodeExchange();

  return (
    <AuthForm
      servicesConfig={servicesConfig}
      loadingService={LinkableService.Ft}
    />
  );
}

export default Callback;
