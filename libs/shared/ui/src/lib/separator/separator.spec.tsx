import { render, screen } from '@testing-library/react';

import Separator, { SeparatorProps } from './separator';

describe('Separator', () => {
  it.each<{ props: SeparatorProps }>([
    { props: {} },
    { props: { width: '300px' } },
  ])('should render successfully (props: $props)', ({ props }) => {
    render(<Separator {...props} />);
    const hrElement = screen.getByRole('separator');
    expect(hrElement).toBeInTheDocument();
    expect(hrElement).toHaveClass('separator');
    expect(hrElement).toHaveStyle({ width: props.width || '100%' });
  });
});
