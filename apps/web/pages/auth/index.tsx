import { withIronSessionSsr } from 'iron-session/next';
import { LinkableService } from '@alekol/shared/enums';
import { User } from '@alekol/shared/interfaces';
import { AuthForm, ContinueAccountCreationHeader } from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import config from '../../lib/config';
import { useState } from 'react';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(config.baseUrl),
  config.ironSession
);

export interface AuthProps {
  user?: User;
}

export function Auth({ user }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState(user);

  if (!sessionUser) return null;

  const servicesConfig = {
    [LinkableService.Discord]: {
      clientId: config[LinkableService.Discord].clientId,
      redirectUri: config[LinkableService.Discord].redirectUri,
      user: sessionUser.accountLinking[LinkableService.Discord],
    },
    [LinkableService.Ft]: {
      clientId: config[LinkableService.Ft].clientId,
      redirectUri: config[LinkableService.Ft].redirectUri,
      user: sessionUser.accountLinking[LinkableService.Ft],
    },
  };

  return (
    <div>
      {sessionUser.accountLinking[LinkableService.Discord] &&
        sessionUser.accountLinking[LinkableService.Ft] && (
          <ContinueAccountCreationHeader
            onLoading={() => {
              setLoading(true);
              return () => {
                setLoading(false);
              };
            }}
          />
        )}
      <AuthForm
        disabled={loading}
        servicesConfig={servicesConfig}
        unlinkService={(service: LinkableService) => {
          setSessionUser((oldUser) => {
            const newUser = JSON.parse(JSON.stringify(oldUser));
            delete newUser.accountLinking[service];
            return newUser;
          });
          return () => {
            setSessionUser(sessionUser);
            return sessionUser;
          };
        }}
      />
    </div>
  );
}

export default Auth;
