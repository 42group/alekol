import { Button, ButtonProps } from '../button/button';
import { generateDiscordOauth2Url } from '@alekol/shared/utils';
import { useEffect, useState } from 'react';

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
  const [href, setHref] = useState<string>();

  useEffect(() => {
    setHref(generateDiscordOauth2Url(clientId, redirectUri));
  }, [clientId, redirectUri]);

  return (
    <Button
      data-testid="discord-oauth2-button"
      href={disabled ? undefined : href}
      color={color}
      width="100%"
      disabled={disabled || !href}
    >
      {children}
    </Button>
  );
}

export default DiscordOauth2Button;
