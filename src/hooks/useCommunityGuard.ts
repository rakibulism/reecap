import { useCallback } from 'react';
import { useReecapStore } from '../store/reecapStore';

/**
 * Plan gate for community write-actions. Free (and guest) users get a
 * preview-only feed: posting, reacting, commenting, reposting and following
 * are Pro-only. `guard(fn)` runs `fn` for Pro users, otherwise opens the
 * upgrade prompt.
 */
export function useCommunityGuard() {
  const isPremium = useReecapStore((s) => s.isPremium);
  const openPremiumPrompt = useReecapStore((s) => s.openPremiumPrompt);

  const guard = useCallback(
    <A extends unknown[]>(fn: (...args: A) => void) =>
      (...args: A) => {
        if (isPremium) fn(...args);
        else openPremiumPrompt();
      },
    [isPremium, openPremiumPrompt],
  );

  return { canInteract: isPremium, guard, openPremiumPrompt };
}
