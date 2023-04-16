import { LinkableService } from '@alekol/shared/enums';
import { AccountLinkingData } from './account-linking';

export interface User {
  accountLinking: {
    [key in LinkableService]?: AccountLinkingData;
  };
}
