/* eslint-disable-next-line */
import * as IronSession from 'iron-session';
import { User } from '@alekol/shared/interfaces';

declare module 'iron-session' {
  interface IronSessionData {
    user?: User;
  }
}
