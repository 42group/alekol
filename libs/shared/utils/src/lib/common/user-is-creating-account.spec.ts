import { User } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { userIsCreatingAccount } from './user-is-creating-account';

let mockUser: User;
const userId = faker.datatype.uuid();

beforeEach(() => {
  mockUser = {
    accountLinking: {
      discord: {
        id: faker.random.numeric(5),
        name: faker.internet.userName(),
        avatarUrl: faker.internet.avatar(),
      },
    },
  };
});

describe('userIsCreatingAccount', () => {
  it('should return true', () => {
    const result = userIsCreatingAccount(mockUser);
    expect(result).toBe(true);
  });

  describe('if the user is logged in', () => {
    beforeEach(() => {
      mockUser.id = userId;
    });

    it('should return false', () => {
      const result = userIsCreatingAccount(mockUser);
      expect(result).toBe(false);
    });
  });

  describe('if the user has not linked at least one account', () => {
    beforeEach(() => {
      mockUser.accountLinking = {};
    });

    it('should return false', () => {
      const result = userIsCreatingAccount(mockUser);
      expect(result).toBe(false);
    });
  });
});
