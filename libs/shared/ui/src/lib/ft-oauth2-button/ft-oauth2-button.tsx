import { ButtonProps } from '../button/button';
import { Oauth2Button } from '../oauth2-button/oauth2-button';

export interface FtOauth2ButtonProps {
  children?: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  redirectUri: string;
}

export function FtOauth2Button({
  children,
  clientId,
  color = 'ft',
  disabled = false,
  redirectUri,
}: FtOauth2ButtonProps) {
  return (
    <Oauth2Button
      clientId={clientId}
      color={color}
      disabled={disabled}
      redirectUri={redirectUri}
      width="100%"
    >
      {children || 'Login with 42'}
    </Oauth2Button>
  );
}

export default FtOauth2Button;
