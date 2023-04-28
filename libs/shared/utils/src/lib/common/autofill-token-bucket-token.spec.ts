import { AutofillTokenBucketToken } from './autofill-token-bucket-token';

const mockSetRefillDate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AutofillTokenBucketToken', () => {
  let token: AutofillTokenBucketToken;

  beforeEach(() => {
    token = new AutofillTokenBucketToken(mockSetRefillDate);
  });

  describe('setDate', () => {
    it('should call the setRefillDate method', () => {
      token.setDate(new Date());
      expect(mockSetRefillDate).toHaveBeenCalled();
    });
  });
});
