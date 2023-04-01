import { generateDiscordOauth2Url } from './generate-discord-oauth2-url';
import { faker } from '@faker-js/faker';

const clientId = faker.random.numeric(17);
const redirectUri = faker.internet.url();

describe('generateDiscordOauth2Url', () => {
  it('should return an URI encoded string', () => {
    const url = generateDiscordOauth2Url(clientId, redirectUri);
    expect(url).toContain(`client_id=${encodeURIComponent(clientId)}`);
    expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
  });
});
