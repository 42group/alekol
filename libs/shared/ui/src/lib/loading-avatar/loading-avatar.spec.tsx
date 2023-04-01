import { render } from '@testing-library/react';

import LoadingAvatar from './loading-avatar';

describe('LoadingAvatar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LoadingAvatar />);
    expect(baseElement).toBeTruthy();
  });
});
