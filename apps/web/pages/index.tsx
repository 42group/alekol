import { Button, DiscordOauth2Button, Separator } from '@alekol/shared/ui';
import styles from '../styles/page-index.module.scss';
import config from '../lib/config';

export function Index() {
  return (
    <div className={styles.container}>
      <p className={styles.description}>
        To get started, login using the service of your choice.
      </p>
      <div className={styles.separator}>
        <Separator />
      </div>
      <div className={styles.buttons}>
        <DiscordOauth2Button
          clientId={config.discord.clientId}
          redirectUri={config.discord.redirectUri}
        />
        <Button color="ft" width="100%">
          Login with 42
        </Button>
      </div>
    </div>
  );
}

export default Index;
