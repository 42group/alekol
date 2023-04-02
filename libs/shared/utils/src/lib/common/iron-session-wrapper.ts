import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { SessionData, User } from '@alekol/shared/interfaces';

/* eslint-disable-next-line */
import * as IronSession from 'iron-session';

declare module 'iron-session' {
  /* eslint-disable-next-line */
  interface IronSessionData extends SessionData {}
}

export function ironSessionWrapper(
  tests: ((
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
    data: { user: User }
  ) => boolean)[] = [],
  redirectRoute = '/'
) {
  return async function getServerSideProps(
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
  ) {
    const { req } = context;
    const user: User = req.session.user || {
      accountLinking: {},
    };

    if (
      !tests.every((test) => {
        return test(context, { user });
      })
    ) {
      return {
        redirect: {
          destination: redirectRoute,
          permanent: false,
        },
      };
    }

    return { props: { user } };
  };
}
