import { ButtonProps } from '../button/button';
import { Oauth2Button } from '../oauth2-button/oauth2-button';

export interface DiscordOauth2ButtonProps {
  children?: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  redirectUri: string;
}

export function DiscordOauth2Button({
  children,
  clientId,
  color = 'discord',
  disabled = false,
  redirectUri,
}: DiscordOauth2ButtonProps) {
  return (
    <Oauth2Button
      clientId={clientId}
      color={color}
      disabled={disabled}
      redirectUri={redirectUri}
      width="100%"
    >
      {children || 'Login with Discord'}
    </Oauth2Button>
  );
}

export default DiscordOauth2Button;
