import { AccountLinkingData } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import LoadingAvatar from '../loading-avatar/loading-avatar';
import LoadingParagraph from '../loading-paragraph/loading-paragraph';
import fetchMock from 'jest-fetch-mock';

import AccountLinking from './account-linking';

jest.mock('../loading-avatar/loading-avatar');
jest.mock('../loading-paragraph/loading-paragraph');

const mockServiceName = faker.company.name();
const mockServiceId = mockServiceName.toLowerCase();
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
          id={mockServiceId}
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
          id={mockServiceId}
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
    it('should be able to unlink', () => {
      render(
        <AccountLinking
          id={mockServiceId}
          linkingComponent={<p>linking component</p>}
          name={mockServiceName}
          user={mockUser}
        />
      );
      const unlinkButtonElement = screen.getByRole('button');
      act(() => {
        unlinkButtonElement.click();
      });
      const linkingComponent = screen.getByText('linking component');
      expect(linkingComponent).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/auth/oauth2/${mockServiceId}/unlink`,
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
  describe('when the component is waiting for linking', () => {
    it('should render the linking component', () => {
      render(
        <AccountLinking
          id={mockServiceId}
          linkingComponent={<p>linking component</p>}
          name={mockServiceName}
        />
      );
      const linkingComponent = screen.getByText('linking component');
      expect(linkingComponent).toBeInTheDocument();
    });
  });
});
