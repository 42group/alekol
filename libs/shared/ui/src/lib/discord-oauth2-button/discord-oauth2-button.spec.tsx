import { render } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import { Oauth2Button } from '../oauth2-button/oauth2-button';

import {
  DiscordOauth2Button,
  DiscordOauth2ButtonProps,
} from './discord-oauth2-button';

jest.mock('../oauth2-button/oauth2-button');

const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();

type DiscordOauth2ButtonOptionalProps = {
  [P in keyof DiscordOauth2ButtonProps]?: DiscordOauth2ButtonProps[P];
};

describe.each<{ props: DiscordOauth2ButtonOptionalProps; text?: string }>([
  { props: {} },
  { props: {}, text: 'Click me' },
  { props: { color: 'primary' } },
  { props: { color: 'primary' }, text: 'Click me' },
  { props: { color: 'secondary' } },
  { props: { color: 'secondary' }, text: 'Click me' },
  { props: { color: 'discord' } },
  { props: { color: 'discord' }, text: 'Click me' },
  { props: { color: 'ft' } },
  { props: { color: 'ft' }, text: 'Click me' },
  { props: { color: 'danger' } },
  { props: { color: 'danger' }, text: 'Click me' },
  { props: { disabled: false } },
  { props: { disabled: false }, text: 'Click me' },
  { props: { disabled: true } },
  { props: { disabled: true }, text: 'Click me' },
  { props: { color: 'primary', disabled: false } },
  { props: { color: 'primary', disabled: false }, text: 'Click me' },
  { props: { color: 'primary', disabled: true } },
  { props: { color: 'primary', disabled: true }, text: 'Click me' },
  { props: { color: 'secondary', disabled: false } },
  { props: { color: 'secondary', disabled: false }, text: 'Click me' },
  { props: { color: 'secondary', disabled: true } },
  { props: { color: 'secondary', disabled: true }, text: 'Click me' },
  { props: { color: 'discord', disabled: false } },
  { props: { color: 'discord', disabled: false }, text: 'Click me' },
  { props: { color: 'discord', disabled: true } },
  { props: { color: 'discord', disabled: true }, text: 'Click me' },
  { props: { color: 'ft', disabled: false } },
  { props: { color: 'ft', disabled: false }, text: 'Click me' },
  { props: { color: 'ft', disabled: true } },
  { props: { color: 'ft', disabled: true }, text: 'Click me' },
  { props: { color: 'danger', disabled: false } },
  { props: { color: 'danger', disabled: false }, text: 'Click me' },
  { props: { color: 'danger', disabled: true } },
  { props: { color: 'danger', disabled: true }, text: 'Click me' },
])("DiscordOauth2Button (props: $props, text: '$text')", ({ props, text }) => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <DiscordOauth2Button
        {...props}
        clientId={clientId}
        redirectUri={redirectUri}
      >
        {text}
      </DiscordOauth2Button>
    );
    expect(baseElement).toBeTruthy();
    expect(Oauth2Button).toHaveBeenCalledWith(
      expect.objectContaining({
        children: text || 'Login with Discord',
        color: props.color || 'discord',
        disabled: props.disabled || false,
      }),
      {}
    );
  });
});
