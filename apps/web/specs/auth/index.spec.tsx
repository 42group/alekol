import React from 'react';
import { render } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import { LinkableService } from '@alekol/shared/enums';

import Auth from '../../pages/auth/index';
import { AccountLinkingData } from '@alekol/shared/interfaces';
import { AuthForm } from '@alekol/shared/ui';
import config from '../../lib/config';

jest.mock('../../lib/config');
jest.mock('@alekol/shared/ui', () => {
  const originalModule = jest.requireActual('@alekol/shared/ui');

  return {
    __esModule: true,
    ...originalModule,
    AuthForm: jest.fn(() => <></>),
  };
});

config[LinkableService.Discord] = {
  clientId: faker.random.numeric(17),
  redirectUri: faker.internet.url(),
};
config[LinkableService.Ft] = {
  clientId: faker.random.numeric(17),
  redirectUri: faker.internet.url(),
};

const mockDiscordUser: AccountLinkingData = {
  id: faker.random.alpha(17),
  name: faker.internet.userName(),
  avatarUrl: faker.internet.avatar(),
};
const mockFtUser: AccountLinkingData = {
  id: faker.random.alpha(5),
  name: faker.internet.userName(),
  avatarUrl: faker.internet.avatar(),
};

describe('Auth', () => {
  describe('when the user is undefined', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<Auth />);
      expect(baseElement).toBeTruthy();
    });
  });
  describe('when the user is defined', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<Auth />);
      expect(baseElement).toBeTruthy();
    });
    it('should pass right informations to AuthForm', () => {
      render(
        <Auth
          user={{
            accountLinking: {
              [LinkableService.Discord]: mockDiscordUser,
              [LinkableService.Ft]: mockFtUser,
            },
          }}
        />
      );
      expect(AuthForm).toHaveBeenCalledWith(
        expect.objectContaining({
          servicesConfig: {
            [LinkableService.Discord]: {
              clientId: config[LinkableService.Discord].clientId,
              redirectUri: config[LinkableService.Discord].redirectUri,
              user: mockDiscordUser,
            },
            [LinkableService.Ft]: {
              clientId: config[LinkableService.Ft].clientId,
              redirectUri: config[LinkableService.Ft].redirectUri,
              user: mockFtUser,
            },
          },
        }),
        {}
      );
    });
  });
});
