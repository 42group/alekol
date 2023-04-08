import { SessionData } from '@alekol/shared/interfaces';
/* eslint-disable-next-line */
import * as IronSession from 'iron-session';

declare module 'iron-session' {
  /* eslint-disable-next-line */
  interface IronSessionData extends SessionData {}
}
