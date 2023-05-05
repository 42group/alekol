import { LinkableService } from '@alekol/shared/enums';

export async function getDuplicateAccounts(baseUrl: string, cookie: string) {
  const response = await fetch(`${baseUrl}/api/auth/check-services`, {
    headers: [['Cookie', cookie]],
  })
    .then<{ duplicates: LinkableService[] }>(async (res) => {
      if (!res.ok) {
        return res.json().then((error) => {
          throw new Error(
            error.message || 'An unexpected error occured... Please try again.'
          );
        });
      }
      return res.json();
    })
    .catch(() => {
      // nothing to do
    });
  if (!response) return null;
  return response.duplicates;
}
