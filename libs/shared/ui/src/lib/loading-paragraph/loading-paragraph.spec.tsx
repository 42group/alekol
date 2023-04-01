import { render } from '@testing-library/react';

import LoadingParagraph from './loading-paragraph';

describe('LoadingParagraph', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoadingParagraph />);
    expect(baseElement).toBeTruthy();
  });
});
