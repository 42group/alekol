import { nanoid } from 'nanoid';

export function getRandomStateFromSessionStorage() {
  let sessionState = sessionStorage.getItem('state');
  if (!sessionState) {
    sessionState = nanoid();
    sessionStorage.setItem('state', sessionState);
  }
  return sessionState;
}
