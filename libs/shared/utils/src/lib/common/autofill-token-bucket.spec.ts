import { faker } from '@faker-js/faker';
import { AutofillTokenBucket } from './autofill-token-bucket';
import { AutofillTokenBucketToken } from './autofill-token-bucket-token';

jest.useFakeTimers();

jest.mock('./autofill-token-bucket-token');
jest.spyOn(global, 'setTimeout');

const MockAutofillTokenBucketToken =
  AutofillTokenBucketToken as jest.MockedClass<typeof AutofillTokenBucketToken>;

const currentDate = new Date();
const tokensNumber = 2;
const refillRate = 1;
const timeBeforeNextToken = parseInt(faker.random.numeric(3));

beforeEach(() => {
  MockAutofillTokenBucketToken.mockClear();
  jest.setSystemTime(currentDate);
});

describe('AutofillTokenBucket', () => {
  let bucket: AutofillTokenBucket;

  beforeEach(() => {
    bucket = new AutofillTokenBucket(tokensNumber, refillRate);
  });

  describe('refill', () => {
    it('should set the last refill date', () => {
      const date = new Date();
      bucket.lastRefillDate = date;
      bucket.refill();
      expect(bucket.lastRefillDate).not.toBe(date);
    });
    it('should set the tokens number', () => {
      bucket.tokensNumber = -1;
      bucket.refill();
      expect(bucket.tokensNumber).toBe(tokensNumber);
    });
  });

  describe('isLastRefillDateExpired', () => {
    describe('if the last refill date is expired', () => {
      it('should return true', () => {
        bucket.lastRefillDate.setTime(
          bucket.lastRefillDate.getTime() - refillRate * 1000
        );
        const result = bucket.isLastRefillDateExpired();
        expect(result).toBe(true);
      });
    });

    describe('if the last refill date is not expired', () => {
      it('should return false', () => {
        bucket.lastRefillDate.setTime(
          bucket.lastRefillDate.getTime() - refillRate * 1000
        );
        const result = bucket.isLastRefillDateExpired();
        expect(result).toBe(true);
      });
    });
  });

  describe('getTimeBeforeNextToken', () => {
    it('should return the difference between next refill time and actual time', () => {
      bucket.lastRefillDate.setTime(bucket.lastRefillDate.getTime() - 1000);
      const time = bucket.getTimeBeforeNextToken();
      expect(time).toBe(
        bucket.lastRefillDate.getTime() +
          bucket.refillRate * 1000 -
          new Date().getTime()
      );
    });
  });

  describe('getToken', () => {
    beforeEach(() => {
      bucket.isLastRefillDateExpired = jest.fn().mockReturnValue(false);
      bucket.getTimeBeforeNextToken = jest
        .fn()
        .mockReturnValue(timeBeforeNextToken);
      bucket.refill = jest.fn();
      bucket.lastRefillDate.setTime(
        bucket.lastRefillDate.getTime() - refillRate * 1000
      );
    });

    it.each([true, false])(
      'should return a new token instance (%s, func)',
      async (hasRefilled) => {
        bucket.isLastRefillDateExpired = jest.fn().mockReturnValue(hasRefilled);
        await bucket.getToken();
        expect(MockAutofillTokenBucketToken).toHaveBeenCalledWith(
          expect.anything()
        );
      }
    );

    it('should remove a token from the bucket', async () => {
      await bucket.getToken();
      expect(bucket.tokensNumber).toBe(bucket.maxTokens - 1);
    });

    describe('the refill method', () => {
      describe('if the token has triggered a refill', () => {
        it('should set the last refill date', async () => {
          bucket.isLastRefillDateExpired = jest.fn().mockReturnValue(true);
          const date = new Date();
          await bucket.getToken();
          MockAutofillTokenBucketToken.mock.calls[0][0](date);
          expect(bucket.lastRefillDate).toStrictEqual(date);
        });
      });

      describe('if the token has not triggered a refill', () => {
        it('should not set the last refill date', async () => {
          const date = new Date();
          await bucket.getToken();
          MockAutofillTokenBucketToken.mock.calls[0][0](date);
          expect(bucket.lastRefillDate).not.toStrictEqual(date);
        });
      });
    });

    describe('if the last refill date is older than refill rate', () => {
      it('should refill the bucket', async () => {
        bucket.isLastRefillDateExpired = jest.fn().mockReturnValue(true);
        await bucket.getToken();
        expect(bucket.refill).toHaveBeenCalled();
      });
    });

    describe('if a token is available', () => {
      beforeEach(() => {
        bucket.tokensNumber = 1;
      });

      it('should not wait for a new token', async () => {
        await bucket.getToken();
        expect(setTimeout).not.toHaveBeenCalled();
      });
      it('should not refill tokens', async () => {
        await bucket.getToken();
        expect(bucket.refill).not.toHaveBeenCalled();
      });
    });

    describe('if no token is available', () => {
      beforeEach(() => {
        bucket.tokensNumber = 0;
      });

      it('should wait for a new token', async () => {
        const promise = bucket.getToken();
        jest.runAllTimers();
        await promise;
        expect(setTimeout).toHaveBeenCalledWith(
          expect.anything(),
          timeBeforeNextToken
        );
      });
      it('should refill tokens', async () => {
        const promise = bucket.getToken();
        jest.runAllTimers();
        await promise;
        expect(bucket.refill).toHaveBeenCalled();
      });
    });
  });
});
