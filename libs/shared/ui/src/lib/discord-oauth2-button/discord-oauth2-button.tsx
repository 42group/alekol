import { Button, ButtonProps } from '../button/button';
import { generateDiscordOauth2Url } from '@alekol/shared/utils';

export interface DiscordOauth2ButtonProps {
  children?: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  redirectUri: string;
}

export function DiscordOauth2Button({
  children = 'Login with Discord',
  clientId,
  color = 'discord',
  disabled = false,
  redirectUri,
}: DiscordOauth2ButtonProps) {
  return (
    <Button
      data-testid="discord-oauth2-button"
      href={
        disabled ? undefined : generateDiscordOauth2Url(clientId, redirectUri)
      }
      color={color}
      width="100%"
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export default DiscordOauth2Button;
