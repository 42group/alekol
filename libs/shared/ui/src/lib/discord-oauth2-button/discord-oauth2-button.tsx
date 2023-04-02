import { Button, ButtonProps } from '../button/button';
import { generateDiscordOauth2Url } from '@alekol/shared/utils';

export interface DiscordOauth2ButtonProps {
  children?: string;
  clientId: string;
  color?: ButtonProps['color'];
  redirectUri: string;
}

export function DiscordOauth2Button({
  children = 'Login with Discord',
  clientId,
  color = 'discord',
  redirectUri,
}: DiscordOauth2ButtonProps) {
  return (
    <Button
      href={generateDiscordOauth2Url(clientId, redirectUri)}
      color={color}
      width="100%"
    >
      {children}
    </Button>
  );
}

export default DiscordOauth2Button;
