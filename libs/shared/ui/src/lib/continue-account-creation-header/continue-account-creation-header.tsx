import { Button } from '../button/button';
import router from 'next/router';
import styles from './continue-account-creation-header.module.scss';
import { useState } from 'react';

export interface ContinueAccountCreationHeaderProps {
  onLoading: () => () => void;
}

export function ContinueAccountCreationHeader({
  onLoading,
}: ContinueAccountCreationHeaderProps) {
  const [loading, setLoading] = useState(false);
  const createAccountOnClick = () => () => {
    setLoading(true);
    const stopLoading = onLoading();
    fetch(`/api/auth/create-account`, {
      method: 'POST',
    })
      .then(async (res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(
              error.message ||
                'An unexpected error occured... Please try again.'
            );
          });
        }
        return res.json();
      })
      .then(() => {
        return router.push('/dashboard');
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        stopLoading();
      });
  };

  return (
    <div className={styles.container}>
      <Button
        color="secondary"
        disabled={loading}
        onClick={createAccountOnClick()}
      >
        Continue
      </Button>
    </div>
  );
}

export default ContinueAccountCreationHeader;
