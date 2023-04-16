import { withIronSessionSsr } from 'iron-session/next';
import { User } from '@alekol/shared/interfaces';
import {
  Button,
  DiscordOauth2Button,
  FtOauth2Button,
  Separator,
} from '@alekol/shared/ui';
import { ironSessionWrapper } from '@alekol/shared/utils';
import styles from '../styles/page-index.module.scss';
import config from '../lib/config';
import { LinkableService } from '@alekol/shared/enums';

export const getServerSideProps = withIronSessionSsr(
  ironSessionWrapper(),
  config.ironSession
);

export interface IndexProps {
  user?: User;
}

export function Index({ user }: IndexProps) {
  if (!user) return null;

  const discordButton = user.accountLinking[LinkableService.Discord] ? (
    <Button href="/auth" color="discord" width="100%">
      Login with Discord
    </Button>
  ) : (
    <DiscordOauth2Button
      clientId={config[LinkableService.Discord].clientId}
      redirectUri={config[LinkableService.Discord].redirectUri}
    />
  );
  const ftButton = user.accountLinking[LinkableService.Ft] ? (
    <Button href="/auth" color="ft" width="100%">
      Login with 42
    </Button>
  ) : (
    <FtOauth2Button
      clientId={config[LinkableService.Ft].clientId}
      redirectUri={config[LinkableService.Ft].redirectUri}
    />
  );

  return (
    <div className={styles.container}>
      <p className={styles.description}>
        To get started, login using the service of your choice.
      </p>
      <div className={styles.separator}>
        <Separator />
      </div>
      <div className={styles.buttons}>
        {discordButton}
        {ftButton}
      </div>
    </div>
  );
}

export default Index;
