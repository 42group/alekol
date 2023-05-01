import { SessionData } from '@alekol/shared/interfaces';
import { User } from '@prisma/client';

declare module 'iron-session' {
  /* eslint-disable-next-line */
  interface IronSessionData extends SessionData {}
}

declare module 'ws' {
  interface WebSocket {
    user: User;
  }
}
