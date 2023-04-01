import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';

import LoadingParagraph from './loading-paragraph';

const paragraph = faker.hacker.phrase();

describe('LoadingParagraph', () => {
  describe('when loading', () => {
    it('should render successfully', () => {
      render(<LoadingParagraph loading={true} />);
      const avatarElement = screen.getByTestId('skeleton-wrapper');
      expect(avatarElement).toBeInTheDocument();
    });
  });

  describe('when not loading', () => {
    it('should render successfully', () => {
      render(<LoadingParagraph>{paragraph}</LoadingParagraph>);
      const avatarElement = screen.getByText(paragraph);
      expect(avatarElement).toBeInTheDocument();
    });
  });
});
