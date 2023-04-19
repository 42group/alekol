import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import mockRouter from 'next-router-mock';

import ContinueAccountCreationHeader from './continue-account-creation-header';

const mockOnLoading = jest.fn();
const mockUser = {
  id: faker.datatype.uuid(),
  discordId: faker.random.numeric(17),
  ftLogin: faker.internet.userName(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ContinueAccountCreationHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContinueAccountCreationHeader onLoading={mockOnLoading} />
    );
    expect(baseElement).toBeTruthy();
  });
  describe('onClick', () => {
    beforeEach(() => {
      fetchMock.mockResponse(JSON.stringify(mockUser));
    });

    it('should create the user', () => {
      render(<ContinueAccountCreationHeader onLoading={mockOnLoading} />);
      const baseElement = screen.getByRole('button');
      act(() => {
        baseElement.click();
      });
      expect(fetchMock).toHaveBeenCalledWith(`/api/auth/create-account`, {
        method: 'POST',
      });
    });
    it('should trigger the passed function', () => {
      render(<ContinueAccountCreationHeader onLoading={mockOnLoading} />);
      const baseElement = screen.getByRole('button');
      act(() => {
        baseElement.click();
      });
      expect(mockOnLoading).toHaveBeenCalled();
    });
  });
});
