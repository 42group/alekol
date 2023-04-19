import { LinkableService } from '@alekol/shared/enums';
import { AccountLinkingData } from './account-linking';

export interface User {
  id?: string;
  accountLinking: {
    [key in LinkableService]?: AccountLinkingData;
  };
}
