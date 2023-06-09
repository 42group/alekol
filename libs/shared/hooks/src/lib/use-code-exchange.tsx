import router from 'next/router';
import { useEffect } from 'react';
import { AuthenticationStatus, LinkableService } from '@alekol/shared/enums';

export const useCodeExchange = (service: LinkableService) => {
  useEffect(() => {
    const storageState = sessionStorage.getItem('state');
    if (
      !router.query.state ||
      !storageState ||
      router.query.state !== storageState
    ) {
      router.replace('/auth');
      return;
    }

    fetch(`/api/auth/oauth2/${service}/code`, {
      method: 'POST',
      body: JSON.stringify({
        code: router.query.code,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          return res.json().then((error) => {
            throw new Error(
              error.message ||
                'An unexpected error occured... Please try again.'
            );
          });
        }
        return res.json();
      })
      .then((res) => {
        if (res.status === AuthenticationStatus.Authenticated)
          return router.replace('/dashboard');
        return router.replace('/auth');
      })
      .catch(() => {
        return router.replace('/auth');
      });
  }, [service]);
};

export const useFtCodeExchange = () => {
  return useCodeExchange(LinkableService.Ft);
};

export const useDiscordCodeExchange = () => {
  return useCodeExchange(LinkableService.Discord);
};
