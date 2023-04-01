import { Button } from '../button/button';
import { generateDiscordOauth2Url } from '@alekol/shared/utils';

export interface DiscordOauth2ButtonProps {
  clientId: string;
  redirectUri: string;
}

export function DiscordOauth2Button({
  clientId,
  redirectUri,
}: DiscordOauth2ButtonProps) {
  return (
    <Button
      href={generateDiscordOauth2Url(clientId, redirectUri)}
      color="discord"
      width="100%"
    >
      Login with Discord
    </Button>
  );
}

export default DiscordOauth2Button;