import { LinkableService } from '@alekol/shared/enums';
import { AccountLinkingData, User } from '@alekol/shared/interfaces';
import AccountLinking from '../account-linking/account-linking';
import DiscordOauth2Button from '../discord-oauth2-button/discord-oauth2-button';
import FtOauth2Button from '../ft-oauth2-button/ft-oauth2-button';
import styles from './auth-form.module.scss';

export interface ServiceConfig {
  clientId: string;
  redirectUri: string;
  user: AccountLinkingData;
}

export interface AuthFormProps {
  disabled?: boolean;
  servicesConfig: {
    [key in LinkableService]: ServiceConfig;
  };
  loadingService?: LinkableService;
  unlinkService: (service: LinkableService) => () => User;
}

export function AuthForm({
  disabled = false,
  servicesConfig,
  unlinkService,
  loadingService,
}: AuthFormProps) {
  const services = [
    {
      id: LinkableService.Discord,
      name: 'Discord',
      ...servicesConfig[LinkableService.Discord],
      linkingComponent: (disabled?: boolean) => (
        <DiscordOauth2Button
          clientId={servicesConfig[LinkableService.Discord].clientId}
          redirectUri={servicesConfig[LinkableService.Discord].redirectUri}
          color="primary"
          disabled={disabled}
        >
          Link
        </DiscordOauth2Button>
      ),
    },
    {
      id: LinkableService.Ft,
      name: '42',
      ...servicesConfig[LinkableService.Ft],
      linkingComponent: (disabled?: boolean) => (
        <FtOauth2Button
          clientId={servicesConfig[LinkableService.Ft].clientId}
          redirectUri={servicesConfig[LinkableService.Ft].redirectUri}
          color="primary"
          disabled={disabled}
        >
          Link
        </FtOauth2Button>
      ),
    },
  ];

  return (
    <div data-testid="auth-form" className={styles.container}>
      {services.map((service) => {
        const loading = service.id === loadingService;
        const disabledBecauseNotLoading =
          !!loadingService && service.id !== loadingService;

        return (
          <AccountLinking
            name={service.name}
            id={service.id}
            linkingComponent={service.linkingComponent(disabled)}
            unlinkService={unlinkService}
            user={service.user}
            loading={loading}
            disabled={disabled || disabledBecauseNotLoading}
            key={service.name}
          />
        );
      })}
    </div>
  );
}

export default AuthForm;
