import { withIronSessionSsr } from 'iron-session/next';
import { LinkableService } from '@alekol/shared/enums';
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

  return <AuthForm servicesConfig={servicesConfig} />;
}

export default Auth;
