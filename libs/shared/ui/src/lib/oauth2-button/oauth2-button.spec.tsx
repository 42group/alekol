import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';
import { Button } from '../button/button';

import { Oauth2Button, Oauth2ButtonProps } from './oauth2-button';

jest.mock('../button/button');

const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();
const serviceName = faker.company.name();
const mockOauth2Url = faker.internet.url();

type Oauth2ButtonOptionalProps = {
  [P in keyof Oauth2ButtonProps]?: Oauth2ButtonProps[P];
};

describe.each<{ props: Oauth2ButtonOptionalProps }>([
  { props: {} },
  { props: { color: 'primary' } },
  { props: { color: 'secondary' } },
  { props: { color: 'discord' } },
  { props: { color: 'ft' } },
  { props: { color: 'danger' } },
  { props: { disabled: false } },
  { props: { disabled: true } },
  { props: { width: '300px' } },
  { props: { color: 'primary', disabled: true } },
  { props: { color: 'secondary', disabled: true } },
  { props: { color: 'discord', disabled: true } },
  { props: { color: 'ft', disabled: true } },
  { props: { color: 'danger', disabled: true } },
  { props: { color: 'primary', disabled: false } },
  { props: { color: 'secondary', disabled: false } },
  { props: { color: 'discord', disabled: false } },
  { props: { color: 'ft', disabled: false } },
  { props: { color: 'danger', disabled: false } },
  { props: { disabled: true, width: '300px' } },
  { props: { disabled: false, width: '300px' } },
  { props: { color: 'primary', width: '300px' } },
  { props: { color: 'secondary', width: '300px' } },
  { props: { color: 'discord', width: '300px' } },
  { props: { color: 'ft', width: '300px' } },
  { props: { color: 'danger', width: '300px' } },
  { props: { color: 'primary', disabled: true, width: '300px' } },
  { props: { color: 'secondary', disabled: true, width: '300px' } },
  { props: { color: 'discord', disabled: true, width: '300px' } },
  { props: { color: 'ft', disabled: true, width: '300px' } },
  { props: { color: 'danger', disabled: true, width: '300px' } },
  { props: { color: 'primary', disabled: false, width: '300px' } },
  { props: { color: 'secondary', disabled: false, width: '300px' } },
  { props: { color: 'discord', disabled: false, width: '300px' } },
  { props: { color: 'ft', disabled: false, width: '300px' } },
  { props: { color: 'danger', disabled: false, width: '300px' } },
])('Oauth2Button', ({ props }) => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <Oauth2Button
        {...props}
        clientId={clientId}
        generateOauth2Url={() => mockOauth2Url}
        redirectUri={redirectUri}
      >
        {`Login with ${serviceName}`}
      </Oauth2Button>
    );
    expect(baseElement).toBeTruthy();
    expect(Button).toHaveBeenCalledWith(
      expect.objectContaining({
        color: props.color || 'primary',
        disabled: props.disabled || false,
        href: props.disabled ? undefined : mockOauth2Url,
        width: props.width || 'auto',
      }),
      {}
    );
  });
  it('should generate the link', () => {
    const mockGenerateOauth2Url = jest.fn(() => mockOauth2Url);

    render(
      <Oauth2Button
        {...props}
        clientId={clientId}
        generateOauth2Url={mockGenerateOauth2Url}
        redirectUri={redirectUri}
      >
        {`Login with ${serviceName}`}
      </Oauth2Button>
    );
    expect(mockGenerateOauth2Url).toHaveBeenCalledWith(clientId, redirectUri);
  });
  it('should disable the button while the URL is generating', () => {
    render(
      <Oauth2Button
        {...props}
        clientId={clientId}
        generateOauth2Url={() => mockOauth2Url}
        redirectUri={redirectUri}
      >
        {`Login with ${serviceName}`}
      </Oauth2Button>
    );
    expect(Button).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
      }),
      {}
    );
    expect(Button).toHaveBeenCalledWith(
      expect.objectContaining({
        href: props.disabled ? undefined : mockOauth2Url,
      }),
      {}
    );
  });
});
