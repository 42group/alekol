import { faker } from '@faker-js/faker';
import { User as UserModel } from '@prisma/client';
import {
  AccountLinkingData,
  DiscordUser,
  FtUser,
} from '@alekol/shared/interfaces';
import { generateDiscordUserAvatarUrl } from '@alekol/shared/utils';

export const mockDiscordUser: DiscordUser = {
  id: faker.random.numeric(17),
  username: faker.internet.userName(),
  discriminator: faker.random.numeric(4),
  avatar: faker.random.numeric(17),
};
export const mockFtUser: FtUser = {
  id: faker.random.numeric(17),
  login: faker.internet.userName(),
  image: {
    link: faker.internet.avatar(),
  },
};

export const mockLinkedDiscord: AccountLinkingData = {
  id: mockDiscordUser.id,
  name: `${mockDiscordUser.username}#${mockDiscordUser.discriminator}`,
  avatarUrl: generateDiscordUserAvatarUrl(mockDiscordUser),
};
export const mockLinkedFt: AccountLinkingData = {
  id: mockFtUser.id,
  name: mockFtUser.login,
  avatarUrl: mockFtUser.image.link,
};

export const mockUser: UserModel = {
  id: faker.datatype.uuid(),
  discordId: mockLinkedDiscord.id,
  ftLogin: mockLinkedFt.name,
};
