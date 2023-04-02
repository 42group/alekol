import router from 'next/router';
import { useEffect } from 'react';

export const useCodeExchange = (service: string) => {
  useEffect(() => {
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
      .then(() => {
        return router.replace('/auth');
      })
      .catch(() => {
        return router.replace('/auth');
      });
  }, [service]);
};

export const useDiscordCodeExchange = () => {
  return useCodeExchange('discord');
};
