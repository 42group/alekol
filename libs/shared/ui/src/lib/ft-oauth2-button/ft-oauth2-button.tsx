import { Button, ButtonProps } from '../button/button';
import { generateFtOauth2Url } from '@alekol/shared/utils';
import { useEffect, useState } from 'react';

export interface FtOauth2ButtonProps {
  children?: string;
  clientId: string;
  color?: ButtonProps['color'];
  disabled?: boolean;
  redirectUri: string;
}

export function FtOauth2Button({
  children = 'Login with 42',
  clientId,
  color = 'ft',
  disabled = false,
  redirectUri,
}: FtOauth2ButtonProps) {
  const [href, setHref] = useState<string>();

  useEffect(() => {
    setHref(generateFtOauth2Url(clientId, redirectUri));
  }, [clientId, redirectUri]);

  return (
    <Button
      data-testid="ft-oauth2-button"
      href={disabled ? undefined : href}
      color={color}
      width="100%"
      disabled={disabled || !href}
    >
      {children}
    </Button>
  );
}

export default FtOauth2Button;
