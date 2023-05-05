import { User } from '@alekol/shared/interfaces';

export function userIsCreatingAccount(user: User) {
  return user.id === undefined && Object.keys(user.accountLinking).length > 0;
}
