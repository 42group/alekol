import { DiscordUser } from '@alekol/shared/interfaces';

export function generateDiscordUserAvatarUrl({
  id,
  discriminator,
  avatar,
}: DiscordUser) {
  if (avatar) return `https://cdn.discordapp.com/avatars/${id}/${avatar}`;
  return `https://cdn.discordapp.com/embed/avatars/${
    parseInt(discriminator) % 5
  }.png`;
}
