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

describe('getRandomStateFromSessionStorage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the sessionStorage is empty', () => {
    it('should return a random string', () => {
      const url = generateDiscordOauth2Url(clientId, redirectUri);
      expect(url).toContain(`client_id=${encodeURIComponent(clientId)}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain(`state=${mockNanoid}`);
    });
    it('should save the string in the sessionStorage', () => {
      generateDiscordOauth2Url(clientId, redirectUri);
      expect(sessionStorage.getItem('state')).toBe(mockNanoid);
    });
  });
  describe('when the sessionStorage has a state', () => {
    it('should return the state', () => {
      const sessionState = faker.random.alphaNumeric(24);
      sessionStorage.setItem('state', sessionState);
      const url = generateDiscordOauth2Url(clientId, redirectUri);
      expect(url).toContain(`client_id=${encodeURIComponent(clientId)}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
      expect(url).toContain(`state=${sessionState}`);
    });
  });
});
