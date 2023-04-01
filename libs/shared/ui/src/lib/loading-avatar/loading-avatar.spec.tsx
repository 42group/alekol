import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';

import LoadingAvatar from './loading-avatar';

const avatarUrl = faker.image.avatar();

describe('LoadingAvatar', () => {
  describe('when loading', () => {
    it('should render successfully', () => {
      render(<LoadingAvatar loading={true} />);
      const avatarElement = screen.getByTestId('skeleton-wrapper');
      expect(avatarElement).toBeInTheDocument();
    });
  });

  describe('when not loading', () => {
    it('should render successfully', () => {
      render(<LoadingAvatar src={avatarUrl} />);
      const avatarElement = screen.getByRole('img');
      expect(avatarElement).toBeInTheDocument();
      expect(avatarElement).toHaveProperty(
        'src',
        expect.stringContaining(encodeURIComponent(avatarUrl))
      );
    });
  });
});
