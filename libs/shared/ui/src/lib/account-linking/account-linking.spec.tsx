import { AccountLinkingData } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import LoadingAvatar from '../loading-avatar/loading-avatar';
import LoadingParagraph from '../loading-paragraph/loading-paragraph';

import AccountLinking from './account-linking';

jest.mock('../loading-avatar/loading-avatar');
jest.mock('../loading-paragraph/loading-paragraph');

const mockServiceName = faker.company.name();
const mockUser: AccountLinkingData = {
  id: faker.random.numeric(17),
  name: faker.internet.userName(),
  avatarUrl: faker.internet.avatar(),
};

describe('AccountLinking', () => {
  describe('when the component is loading', () => {
    it('should render loading components', () => {
      render(
        <AccountLinking
          loading={true}
          linkingComponent={<p>link</p>}
          name={mockServiceName}
        />
      );
      expect(LoadingAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ loading: true }),
        {}
      );
      expect(LoadingParagraph).toHaveBeenCalledWith(
        expect.objectContaining({ loading: true }),
        {}
      );
    });
  });
  describe('when the component is passed an user', () => {
    it('should render user informations', () => {
      render(
        <AccountLinking
          linkingComponent={<p>link</p>}
          name={mockServiceName}
          user={mockUser}
        />
      );
      expect(LoadingAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ src: mockUser.avatarUrl }),
        {}
      );
      expect(LoadingParagraph).toHaveBeenCalledWith(
        expect.objectContaining({ children: mockUser.name }),
        {}
      );
    });
  });
  describe('when the component is waiting for linking', () => {
    it('should render the linking component', () => {
      render(
        <AccountLinking
          linkingComponent={<p>linking component</p>}
          name={mockServiceName}
        />
      );
      const linkingComponent = screen.getByText('linking component');
      expect(linkingComponent).toBeInTheDocument();
    });
  });
});
