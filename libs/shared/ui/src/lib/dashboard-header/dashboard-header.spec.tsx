import { act, render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import mockRouter from 'next-router-mock';

import DashboardHeader from './dashboard-header';

describe('DashboardHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockResponse('');
  });

  it('should render successfully', () => {
    const { baseElement } = render(<DashboardHeader />);
    expect(baseElement).toBeTruthy();
  });

  describe('on click', () => {
    it('should logout the user', () => {
      render(<DashboardHeader />);
      const buttonElement = screen.getByRole('button');
      act(() => {
        buttonElement.click();
      });
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
    });
    it('should redirect to /', () => {
      mockRouter.push('/dashboard');
      render(<DashboardHeader />);
      const buttonElement = screen.getByRole('button');
      act(() => {
        buttonElement.click();
      });
      expect(mockRouter).toMatchObject({
        asPath: '/',
        pathname: '/',
      });
    });

    describe('on fail', () => {
      it('should not crash', () => {
        fetchMock.mockReject();
        render(<DashboardHeader />);
        const buttonElement = screen.getByRole('button');
        act(() => {
          buttonElement.click();
        });
      });
    });
  });
});
