import { LinkableService } from '@alekol/shared/enums';
import { AccountLinkingData, User } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { IncomingMessage } from 'http';
import { IronSession } from 'iron-session';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { ironSessionWrapper } from './iron-session-wrapper';

const generateAccountLinking = (): AccountLinkingData => {
  return {
    id: faker.random.numeric(5),
    name: faker.internet.userName(),
    avatarUrl: faker.internet.avatar(),
  };
};

const user: User = {
  accountLinking: {
    [LinkableService.Discord]: generateAccountLinking(),
    [LinkableService.Ft]: generateAccountLinking(),
  },
};

const mockRequest = {
  session: {
    user,
  } as IronSession,
} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> };

const mockEmptyRequest = {
  session: {} as IronSession,
} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> };

describe('ironSessionWrapper', () => {
  describe('when no tests are provided', () => {
    it('should return the user in props', async () => {
      const { props } = await ironSessionWrapper()({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty('user', expect.objectContaining(user));
    });
    it('should return an empty user', async () => {
      const { props } = await ironSessionWrapper()({
        req: mockEmptyRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty(
        'user',
        expect.objectContaining({ accountLinking: {} })
      );
    });
  });
  describe('when all tests pass', () => {
    it('should return the user in props', async () => {
      const { props } = await ironSessionWrapper([() => true, () => true])({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty('user', expect.objectContaining(user));
    });
    it('should return an empty user', async () => {
      const { props } = await ironSessionWrapper([() => true, () => true])({
        req: mockEmptyRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty(
        'user',
        expect.objectContaining({ accountLinking: {} })
      );
    });
  });
  describe('when no tests pass', () => {
    it.each([undefined, '/auth'])(
      'should return the redirect path (%s)',
      async (redirectPath) => {
        const { redirect } = await ironSessionWrapper(
          [() => false, () => false],
          redirectPath
        )({
          req: mockRequest,
        } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
        expect(redirect).toHaveProperty('destination', redirectPath || '/');
      }
    );
  });
  describe('when some test does not pass', () => {
    it.each([undefined, '/auth'])(
      'should return the redirect path (%s)',
      async (redirectPath) => {
        const { redirect } = await ironSessionWrapper(
          [() => true, () => false, () => true],
          redirectPath
        )({
          req: mockRequest,
        } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
        expect(redirect).toHaveProperty('destination', redirectPath || '/');
      }
    );
  });
});
