import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { User } from '@alekol/shared/interfaces';

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

    try {
      // Execute the tests passed in arguments.
      if (
        !tests.every((test) => {
          return test(context, { user });
        })
      ) {
        throw 'One or more tests have failed';
      }
    } catch (error) {
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
