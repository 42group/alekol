import { withIronSessionSsr } from 'iron-session/next';
import { User } from '@alekol/shared/interfaces';
import { AuthForm } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import { useDiscordCodeExchange } from '@alekol/shared/hooks';
import config from '../../../../../lib/config';
import { LinkableService } from '@alekol/shared/enums';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(
    config.baseUrl,
    [
      ({ query }) => !!query.code,
      (_, { user }) => !user.accountLinking[LinkableService.Discord],
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

  useDiscordCodeExchange();

  return (
    <AuthForm
      servicesConfig={servicesConfig}
      loadingService={LinkableService.Discord}
      unlinkService={() => () => user}
    />
  );
}

export default Callback;
