import { Button } from '../button/button';
import { AccountLinkingData } from '@alekol/shared/interfaces';
import LoadingAvatar from '../loading-avatar/loading-avatar';
import LoadingParagraph from '../loading-paragraph/loading-paragraph';
import styles from './account-linking.module.scss';
import { ReactElement } from 'react';

export interface AccountLinkingProps {
  disabled?: boolean;
  linkingComponent: ReactElement;
  loading?: boolean;
  name: string;
  user?: AccountLinkingData;
}

export function AccountLinking({
  disabled = false,
  linkingComponent,
  loading = false,
  name,
  user,
}: AccountLinkingProps) {
  let children;
  if (loading) {
    children = (
      <>
        <LoadingAvatar loading={loading} />
        <LoadingParagraph loading={loading} />
        <Button width="100%" color="danger" disabled>
          Unlink
        </Button>
      </>
    );
  } else if (user) {
    children = (
      <>
        <LoadingAvatar src={user.avatarUrl} />
        <LoadingParagraph>{user.name}</LoadingParagraph>
        <Button width="100%" color="danger" disabled={disabled}>
          Unlink
        </Button>
      </>
    );
  } else {
    children = linkingComponent;
  }
  return (
    <div className={styles.container}>
      <h4>{name}</h4>
      {children}
    </div>
  );
}

export default AccountLinking;
