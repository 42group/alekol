import { Button } from '../button/button';
import { AccountLinkingData, User } from '@alekol/shared/interfaces';
import LoadingAvatar from '../loading-avatar/loading-avatar';
import LoadingParagraph from '../loading-paragraph/loading-paragraph';
import styles from './account-linking.module.scss';
import { ReactElement, useState } from 'react';
import { LinkableService } from '@alekol/shared/enums';

export interface AccountLinkingProps {
  disabled?: boolean;
  id: LinkableService;
  linkingComponent: ReactElement;
  loading?: boolean;
  name: string;
  unlinkService: (service: LinkableService) => () => User;
  user?: AccountLinkingData;
}

export function AccountLinking({
  disabled = false,
  id,
  linkingComponent,
  loading = false,
  name,
  unlinkService,
  user,
}: AccountLinkingProps) {
  const [displayedUser, setDisplayedUser] = useState(user);
  const unlinkAccountOnClick = () => () => {
    setDisplayedUser(undefined);
    const rollbackUnlink = unlinkService(id);
    fetch(`/api/auth/oauth2/${id}/unlink`, {
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
      })
      .catch(() => {
        setDisplayedUser(user);
        rollbackUnlink();
      });
  };

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
  } else if (displayedUser) {
    children = (
      <>
        <LoadingAvatar src={displayedUser.avatarUrl} />
        <LoadingParagraph>{displayedUser.name}</LoadingParagraph>
        <Button
          width="100%"
          color="danger"
          disabled={disabled}
          onClick={unlinkAccountOnClick()}
        >
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
