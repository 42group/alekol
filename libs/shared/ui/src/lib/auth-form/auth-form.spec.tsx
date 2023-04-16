import { LinkableService } from '@alekol/shared/enums';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import { AccountLinkingProps } from '../account-linking/account-linking';

import AuthForm from './auth-form';

const mockAccountLinking = jest.fn<void, [AccountLinkingProps]>();
jest.mock(
  '../account-linking/account-linking',
  () => (props: AccountLinkingProps) => {
    mockAccountLinking(props);
  }
);
const mockUnlinkService = jest.fn(() => jest.fn());

const generateServiceConfig = () => ({
  clientId: faker.random.alphaNumeric(17),
  redirectUri: faker.internet.url(),
  user: {
    id: faker.random.numeric(5),
    name: faker.internet.userName(),
    avatarUrl: faker.internet.avatar(),
  },
});

const discordConfig = generateServiceConfig();
const ftConfig = generateServiceConfig();

describe('AuthForm', () => {
  beforeEach(() => {
    mockAccountLinking.mockReset();
  });

  it('should render successfully', () => {
    render(
      <AuthForm
        servicesConfig={{
          [LinkableService.Discord]: discordConfig,
          [LinkableService.Ft]: ftConfig,
        }}
        unlinkService={mockUnlinkService}
      />
    );
    const baseElement = screen.getByTestId('auth-form');
    expect(baseElement).toBeInTheDocument();
  });

  describe('when discord is loading', () => {
    it('should display a loading animation and disable other forms', () => {
      render(
        <AuthForm
          servicesConfig={{
            [LinkableService.Discord]: discordConfig,
            [LinkableService.Ft]: ftConfig,
          }}
          loadingService={LinkableService.Discord}
          unlinkService={mockUnlinkService}
        />
      );
      const baseElement = screen.getByTestId('auth-form');
      expect(baseElement).toBeInTheDocument();
      expect(mockAccountLinking.mock.calls[0][0]).toMatchObject({
        loading: true,
      });
    });
    it('should disable 42 account linking', () => {
      render(
        <AuthForm
          servicesConfig={{
            [LinkableService.Discord]: discordConfig,
            [LinkableService.Ft]: ftConfig,
          }}
          loadingService={LinkableService.Discord}
          unlinkService={mockUnlinkService}
        />
      );
      const baseElement = screen.getByTestId('auth-form');
      expect(baseElement).toBeInTheDocument();
      expect(
        mockAccountLinking.mock.calls[1][0].linkingComponent.props
      ).toMatchObject({
        disabled: true,
      });
    });
  });
});
