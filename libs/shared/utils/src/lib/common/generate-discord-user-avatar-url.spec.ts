import { generateDiscordUserAvatarUrl } from './generate-discord-user-avatar-url';
import { DiscordUser } from '@alekol/shared/interfaces';
import { faker } from '@faker-js/faker';

const mockDiscordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.numeric(4),
  avatar: faker.random.numeric(17),
};
const mockAvatarlessDiscordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.numeric(4),
  avatar: null,
};

describe('generateDiscordUserAvatarUrl', () => {
  describe('when the user has an avatar', () => {
    it('should return its own avatar URL', () => {
      const url = generateDiscordUserAvatarUrl(mockDiscordUser);
      expect(url).toBe(
        `https://cdn.discordapp.com/avatars/${mockDiscordUser.id}/${mockDiscordUser.avatar}`
      );
    });
  });
  describe('when the user does not have an avatar', () => {
    it('should return a default one based on its discriminator', () => {
      const url = generateDiscordUserAvatarUrl(mockAvatarlessDiscordUser);
      expect(url).toBe(
        `https://cdn.discordapp.com/embed/avatars/${
          parseInt(mockAvatarlessDiscordUser.discriminator) % 5
        }.png`
      );
    });
  });
});
