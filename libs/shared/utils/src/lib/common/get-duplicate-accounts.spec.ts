import { LinkableService } from '@alekol/shared/enums';
import { faker } from '@faker-js/faker';
import fetchMock from 'jest-fetch-mock';
import { getDuplicateAccounts } from './get-duplicate-accounts';

const baseUrl = faker.internet.url();
const cookie = faker.random.alphaNumeric(20);
const mockDuplicates = [LinkableService.Ft];

beforeEach(() => {
  fetchMock.mockResponse(JSON.stringify({ duplicates: mockDuplicates }));
});

describe('getDuplicateAccounts', () => {
  it('should check services from the API', async () => {
    await getDuplicateAccounts(baseUrl, cookie);
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/api/auth/check-services`,
      {
        headers: [['Cookie', cookie]],
      }
    );
  });

  describe('if the response is undefined', () => {
    it('should return null', async () => {
      fetchMock.mockRejectOnce();
      const duplicates = await getDuplicateAccounts(baseUrl, cookie);
      expect(duplicates).toBeNull();
    });
  });

  describe('if the response is valid', () => {
    it('should return the duplicate accounts', async () => {
      const duplicates = await getDuplicateAccounts(baseUrl, cookie);
      expect(duplicates).toStrictEqual(mockDuplicates);
    });
  });
});
