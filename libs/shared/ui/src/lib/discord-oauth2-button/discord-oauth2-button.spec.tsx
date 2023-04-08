import { generateDiscordOauth2Url } from '@alekol/shared/utils';
import { render, screen } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import DiscordOauth2Button, {
  DiscordOauth2ButtonProps,
} from './discord-oauth2-button';

const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();

type DiscordOauth2ButtonOptionalProps = {
  [P in keyof DiscordOauth2ButtonProps]?: DiscordOauth2ButtonProps[P];
};

describe.each<{ props: DiscordOauth2ButtonOptionalProps; text?: string }>([
  { props: {} },
  { props: { color: 'primary' } },
  { props: { color: 'secondary' } },
  { props: { color: 'discord' } },
  { props: { color: 'ft' } },
  { props: {}, text: 'Click me' },
  { props: { color: 'primary' }, text: 'Click me' },
  { props: { color: 'secondary' }, text: 'Click me' },
  { props: { color: 'discord' }, text: 'Click me' },
  { props: { color: 'ft' }, text: 'Click me' },
  { props: { disabled: true } },
  { props: { color: 'primary', disabled: true } },
  { props: { color: 'secondary', disabled: true } },
  { props: { color: 'discord', disabled: true } },
  { props: { color: 'ft', disabled: true } },
  { props: { disabled: true }, text: 'Click me' },
  { props: { color: 'primary', disabled: true }, text: 'Click me' },
  { props: { color: 'secondary', disabled: true }, text: 'Click me' },
  { props: { color: 'discord', disabled: true }, text: 'Click me' },
  { props: { color: 'ft', disabled: true }, text: 'Click me' },
])("DiscordOauth2Button (props: $props, text: '$text')", ({ props, text }) => {
  it('should render successfully', () => {
    render(
      <DiscordOauth2Button
        {...props}
        clientId={clientId}
        redirectUri={redirectUri}
      >
        {text}
      </DiscordOauth2Button>
    );
    let buttonElement;
    if (props.disabled) buttonElement = screen.getByRole('button');
    else buttonElement = screen.getByRole('link');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass(props.color || 'discord');
    if (props.disabled) expect(buttonElement).toHaveProperty('disabled', true);
    else
      expect(buttonElement).toHaveProperty(
        'href',
        generateDiscordOauth2Url(clientId, redirectUri)
      );
    expect(buttonElement.textContent).toBe(text || 'Login with Discord');
  });
});
