import { generateDiscordOauth2Url } from './generate-discord-oauth2-url';
import { faker } from '@faker-js/faker';

const mockNanoid = faker.random.alphaNumeric(24);
const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();

jest.mock('nanoid', () => {
  return {
    nanoid: () => mockNanoid,
  };
});

describe('generateDiscordOauth2Url', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return an URI encoded string', () => {
    const url = generateDiscordOauth2Url(clientId, redirectUri);
    expect(url).toContain(`client_id=${encodeURIComponent(clientId)}`);
    expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
    expect(url).toContain(`state=${mockNanoid}`);
  });
});
