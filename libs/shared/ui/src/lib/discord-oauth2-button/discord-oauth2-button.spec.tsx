import { generateDiscordOauth2Url } from '@alekol/shared/utils';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import DiscordOauth2Button from './discord-oauth2-button';

const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();

describe('DiscordOauth2Button', () => {
  it('should render successfully', () => {
    render(
      <DiscordOauth2Button clientId={clientId} redirectUri={redirectUri} />
    );
    const buttonElement = screen.getByRole('link');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveProperty(
      'href',
      generateDiscordOauth2Url(clientId, redirectUri)
    );
  });
});
