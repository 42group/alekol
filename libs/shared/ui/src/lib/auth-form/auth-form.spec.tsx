import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';

import AuthForm from './auth-form';

const serviceConfig = {
  clientId: faker.random.alphaNumeric(17),
  redirectUri: faker.internet.url(),
  user: {
    id: faker.random.alphaNumeric(5),
    name: faker.internet.userName(),
    avatarUrl: faker.internet.avatar(),
  },
};

describe('AuthForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AuthForm
        servicesConfig={{ discord: serviceConfig, ft: serviceConfig }}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
