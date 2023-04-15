import { Button, ButtonProps } from '../button/button';
import { generateFtOauth2Url } from '@alekol/shared/utils';
import { useEffect, useState } from 'react';

export interface Oauth2ButtonProps {
  children: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  redirectUri: string;
  width?: ButtonProps['width'];
}

export function Oauth2Button({
  children,
  clientId,
  color = 'primary',
  disabled = false,
  redirectUri,
  width = 'auto',
}: Oauth2ButtonProps) {
  const [href, setHref] = useState<string>();

  useEffect(() => {
    setHref(generateFtOauth2Url(clientId, redirectUri));
  }, [clientId, redirectUri]);

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
