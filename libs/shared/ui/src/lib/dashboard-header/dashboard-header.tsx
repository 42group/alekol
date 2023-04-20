import { Button } from '../button/button';
import styles from './dashboard-header.module.scss';

export function DashboardHeader() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Button color="secondary">Logout</Button>
      </div>
    </div>
  );
}

export default DashboardHeader;
