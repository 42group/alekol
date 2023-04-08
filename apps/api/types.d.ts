import { SessionData } from '@alekol/shared/interfaces';

declare module 'iron-session' {
  /* eslint-disable-next-line */
  interface IronSessionData extends SessionData {}
}
