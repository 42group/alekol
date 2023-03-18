import { Button, Separator } from '@alekol/shared/ui';
import styles from '../styles/page-index.module.scss';

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
        <Button color="discord" width="100%">
          Login with Discord
        </Button>
        <Button color="ft" width="100%">
          Login with 42
        </Button>
      </div>
    </div>
  );
}

export default Index;
