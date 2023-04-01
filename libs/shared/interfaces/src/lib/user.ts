import { AccountLinkingData } from './account-linking';

export interface User {
  accountLinking: {
    discord?: AccountLinkingData;
    ft?: AccountLinkingData;
  };
}
