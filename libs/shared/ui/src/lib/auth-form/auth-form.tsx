import { AccountLinkingData } from '@alekol/shared/interfaces';
import AccountLinking from '../account-linking/account-linking';
import { Button } from '../button/button';
import DiscordOauth2Button from '../discord-oauth2-button/discord-oauth2-button';
import styles from './auth-form.module.scss';

export type AuthServices = 'Discord' | '42';

export interface ServiceConfig {
  clientId: string;
  redirectUri: string;
  user: AccountLinkingData;
}

export interface AuthFormProps {
  servicesConfig: {
    discord: ServiceConfig;
    ft: ServiceConfig;
  };
  loadingService?: string;
}

export function AuthForm({ servicesConfig, loadingService }: AuthFormProps) {
  const services = [
    {
      name: 'Discord',
      ...servicesConfig.discord,
      linkingComponent: (disabled?: boolean) => (
        <DiscordOauth2Button
          clientId={servicesConfig.discord.clientId}
          redirectUri={servicesConfig.discord.redirectUri}
          color="primary"
          disabled={disabled}
        >
          Link
        </DiscordOauth2Button>
      ),
    },
    {
      name: '42',
      ...servicesConfig.ft,
      linkingComponent: (disabled?: boolean) => (
        <Button width="100%" color="primary" disabled={disabled}>
          Link
        </Button>
      ),
    },
  ];

  return (
    <div data-testid="auth-form" className={styles.container}>
      {services.map((service) => {
        const loading = service.name === loadingService;
        const disabled = !!loadingService && service.name !== loadingService;

        return (
          <AccountLinking
            name={service.name}
            linkingComponent={service.linkingComponent(disabled)}
            user={service.user}
            loading={loading}
            key={service.name}
          />
        );
      })}
    </div>
  );
}

export default AuthForm;
