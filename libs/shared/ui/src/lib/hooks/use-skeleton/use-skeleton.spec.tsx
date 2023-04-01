import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import { useSkeleton } from './use-skeleton';

const className = faker.color.cssSupportedSpace();

describe('useSkeleton', () => {
  describe('when given a component', () => {
    it('should return the given component', () => {
      render(useSkeleton(<p>Hello, World!</p>, className));
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });
  });

  describe('when not given any component', () => {
    it('should return a skeleton', () => {
      render(useSkeleton(null, className));
      const skeletonElement = screen.getByTestId('skeleton-wrapper');
      expect(skeletonElement).toBeInTheDocument();
      expect(skeletonElement).toHaveClass(className);
    });
  });
});
