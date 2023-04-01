import { render } from '@testing-library/react';

import AccountLinking from './account-linking';

describe('AccountLinking', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AccountLinking />);
    expect(baseElement).toBeTruthy();
  });
});
