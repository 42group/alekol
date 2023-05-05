import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { User } from '@alekol/shared/interfaces';
import { LinkableService } from '@alekol/shared/enums';
import { getDuplicateAccounts } from './get-duplicate-accounts';
import { userIsCreatingAccount } from './user-is-creating-account';

export function ironSessionWrapper(
  baseUrl: string,
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

    let duplicates: LinkableService[] | null = [];
    try {
      // Execute the tests passed in arguments.
      if (
        !tests.every((test) => {
          return test(context, { user });
        })
      ) {
        throw 'One or more tests have failed';
      }

      // Check account duplicates.
      // Only if the user is creating an account,
      // to avoid unnecessary checks.
      if (userIsCreatingAccount(user)) {
        duplicates = await getDuplicateAccounts(
          baseUrl,
          `${req.headers.cookie}`
        );
        if (duplicates === null) {
          throw 'The request to get duplicate accounts has failed';
        }
      }
    } catch (error) {
      return {
        redirect: {
          destination: redirectRoute,
          permanent: false,
        },
      };
    }

    for (const service of duplicates) {
      delete user.accountLinking[service];
    }

    await req.session.save();

    return {
      props: {
        duplicates,
        user,
      },
    };
  };
}
