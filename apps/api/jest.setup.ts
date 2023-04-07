import { SessionData } from '@alekol/shared/interfaces';

/* eslint-disable-next-line */
import IronSession from 'iron-session';
declare module 'iron-session' {
  /* eslint-disable-next-line */
  interface IronSessionData extends SessionData {}
}
