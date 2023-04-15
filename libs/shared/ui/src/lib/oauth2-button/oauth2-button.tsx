import { Button, ButtonProps } from '../button/button';
import { useEffect, useState } from 'react';

export interface Oauth2ButtonProps {
  children: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  generateOauth2Url: (clientId: string, redirectUri: string) => string;
  redirectUri: string;
  width?: ButtonProps['width'];
}

export function Oauth2Button({
  children,
  clientId,
  color = 'primary',
  disabled = false,
  generateOauth2Url,
  redirectUri,
  width = 'auto',
}: Oauth2ButtonProps) {
  const [href, setHref] = useState<string>();

  useEffect(() => {
    setHref(generateOauth2Url(clientId, redirectUri));
  }, [clientId, generateOauth2Url, redirectUri]);

  return (
    <Button
      data-testid="oauth2-button"
      href={disabled ? undefined : href}
      color={color}
      disabled={disabled || !href}
      width={width}
    >
      {children}
    </Button>
  );
}

export default Oauth2Button;
