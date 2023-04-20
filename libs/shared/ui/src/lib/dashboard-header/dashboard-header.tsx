import { Button } from '../button/button';
import router from 'next/router';
import styles from './dashboard-header.module.scss';

export function DashboardHeader() {
  const logoutOnClick = () => () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(
              error.message ||
                'An unexpected error occured... Please try again.'
            );
          });
        }
      })
      .catch(() => {
        // nothing to do
      });
    return router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Button color="secondary" onClick={logoutOnClick()}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default DashboardHeader;
