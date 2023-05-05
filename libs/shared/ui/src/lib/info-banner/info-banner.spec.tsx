import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';

import InfoBanner, { InfoBannerProps } from './info-banner';

const title = faker.hacker.ingverb();
const message = faker.hacker.phrase();

describe('InfoBanner', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <InfoBanner title={title}>{message}</InfoBanner>
    );
    expect(baseElement).toBeTruthy();
  });

  it.each<{ props: Partial<InfoBannerProps> }>([
    { props: {} },
    { props: { color: 'info' } },
    { props: { color: 'warn' } },
    { props: { color: 'error' } },
  ])('should have a color', ({ props }) => {
    render(
      <InfoBanner {...props} title={title}>
        {message}
      </InfoBanner>
    );
    const element = screen.getByTestId('info-banner');
    expect(element).toHaveClass(props.color || 'info');
  });
  it('should contain the title', () => {
    render(<InfoBanner title={title}>{message}</InfoBanner>);
    expect(screen.getByText(title)).toBeTruthy();
  });
  it('should contain the content', () => {
    render(<InfoBanner title={title}>{message}</InfoBanner>);
    expect(screen.getByText(message)).toBeTruthy();
  });
});
