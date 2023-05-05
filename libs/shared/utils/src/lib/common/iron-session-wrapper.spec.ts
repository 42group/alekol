import { LinkableService } from '@alekol/shared/enums';
import { AccountLinkingData, User } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { IncomingMessage } from 'http';
import { IronSession } from 'iron-session';
import { GetServerSidePropsContext, PreviewData } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getDuplicateAccounts } from './get-duplicate-accounts';
import { userIsCreatingAccount } from './user-is-creating-account';

import { ironSessionWrapper } from './iron-session-wrapper';

const generateAccountLinking = (): AccountLinkingData => {
  return {
    id: faker.random.numeric(5),
    name: faker.internet.userName(),
    avatarUrl: faker.internet.avatar(),
  };
};

let user: User = { accountLinking: {} };

const baseUrl = faker.internet.url();
const cookie = faker.random.alphaNumeric(20);
const mockSession = {
  save: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockReturnValue(undefined),
};
const mockRequest = {
  headers: {
    cookie,
  },
  session: {
    ...mockSession,
  } as IronSession,
} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> };

const mockEmptyRequest = {
  session: {
    ...mockSession,
  } as IronSession,
} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> };

jest.mock('./get-duplicate-accounts');
jest.mock('./user-is-creating-account');

const mockGetDuplicateAccounts = getDuplicateAccounts as jest.Mock;
const mockUserIsCreatingAccount = userIsCreatingAccount as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  user = {
    accountLinking: {
      [LinkableService.Discord]: generateAccountLinking(),
      [LinkableService.Ft]: generateAccountLinking(),
    },
  };
  mockRequest.session.user = user;
  mockGetDuplicateAccounts.mockResolvedValue([]);
  mockUserIsCreatingAccount.mockReturnValue(false);
});

describe('ironSessionWrapper', () => {
  describe('when no tests are provided', () => {
    it('should check if the user is creating an account', async () => {
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockUserIsCreatingAccount).toHaveBeenCalledWith(user);
    });
    it('should get duplicate accounts', async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockGetDuplicateAccounts).toHaveBeenCalledWith(baseUrl, cookie);
    });
    it("should handle request's error", async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      mockGetDuplicateAccounts.mockResolvedValueOnce(null);
      const { redirect } = await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(redirect).toHaveProperty('destination', '/');
    });
    it.each([
      { duplicateServices: [LinkableService.Discord] },
      { duplicateServices: [LinkableService.Ft] },
      { duplicateServices: [LinkableService.Discord, LinkableService.Ft] },
    ])(
      'should delete the duplicate services from the session ($duplicateServices)',
      async ({ duplicateServices }) => {
        mockUserIsCreatingAccount.mockReturnValueOnce(true);
        mockGetDuplicateAccounts.mockResolvedValueOnce(duplicateServices);
        const userCopy = { accountLinking: { ...user.accountLinking } };
        await ironSessionWrapper(baseUrl)({
          req: mockRequest,
        } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
        for (const service of duplicateServices) {
          delete userCopy.accountLinking[service];
        }
        expect(user).toStrictEqual(userCopy);
      }
    );
    it('should save the session', async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      mockGetDuplicateAccounts.mockResolvedValueOnce([]);
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockRequest.session.save).toHaveBeenCalled();
    });
    it('should return the user in props', async () => {
      const { props } = await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty('user', expect.objectContaining(user));
    });
    it('should return an empty user', async () => {
      const { props } = await ironSessionWrapper(baseUrl)({
        req: mockEmptyRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty(
        'user',
        expect.objectContaining({ accountLinking: {} })
      );
    });
  });
  describe('when all tests pass', () => {
    it('should check if the user is creating an account', async () => {
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockUserIsCreatingAccount).toHaveBeenCalledWith(user);
    });
    it('should get duplicate accounts', async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockGetDuplicateAccounts).toHaveBeenCalledWith(baseUrl, cookie);
    });
    it("should handle request's error", async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      mockGetDuplicateAccounts.mockResolvedValueOnce(null);
      const { redirect } = await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(redirect).toHaveProperty('destination', '/');
    });
    it.each([
      { duplicateServices: [LinkableService.Discord] },
      { duplicateServices: [LinkableService.Ft] },
      { duplicateServices: [LinkableService.Discord, LinkableService.Ft] },
    ])(
      'should delete the duplicate services from the session ($duplicateServices)',
      async ({ duplicateServices }) => {
        mockUserIsCreatingAccount.mockReturnValueOnce(true);
        mockGetDuplicateAccounts.mockResolvedValueOnce(duplicateServices);
        const userCopy = { accountLinking: { ...user.accountLinking } };
        await ironSessionWrapper(baseUrl)({
          req: mockRequest,
        } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
        for (const service of duplicateServices) {
          delete userCopy.accountLinking[service];
        }
        expect(user).toStrictEqual(userCopy);
      }
    );
    it('should save the session', async () => {
      mockUserIsCreatingAccount.mockReturnValueOnce(true);
      mockGetDuplicateAccounts.mockResolvedValueOnce([]);
      await ironSessionWrapper(baseUrl)({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(mockRequest.session.save).toHaveBeenCalled();
    });
    it('should return the user in props', async () => {
      const { props } = await ironSessionWrapper(baseUrl, [
        () => true,
        () => true,
      ])({
        req: mockRequest,
      } as GetServerSidePropsContext<ParsedUrlQuery, PreviewData>);
      expect(props).toHaveProperty('user', expect.objectContaining(user));
    });
    it('should return an empty user', async () => {
      const { props } = await ironSessionWrapper(baseUrl, [
        () => true,
        () => true,
      ])({
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
          baseUrl,
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
          baseUrl,
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
