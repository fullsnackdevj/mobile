import { useMemo } from 'react';
import { recommend, scoreItem, Vary } from './recommend';
import { useCurrentMenu, useStore } from './store';

/** `vary` makes the top pick rotate among close matches (used by the results screen). */
export function usePicks(vary?: Vary) {
  const menu = useCurrentMenu();
  const taste = useStore((s) => s.taste);
  const dislikes = useStore((s) => s.dislikes);
  const mood = useStore((s) => s.mood);
  const history = useStore((s) => s.history);
  const learn = useStore((s) => s.privacy.learn);
  const picks = useMemo(() => (menu ? recommend(menu.items, taste, dislikes, mood, history, learn, menu, vary) : null), [menu, taste, dislikes, mood, history, learn, vary?.seed, vary?.avoid]);
  const scoreOf = (itemId: string) => {
    const i = menu?.items.find((x) => x.id === itemId);
    return i ? scoreItem(i, taste, mood, history, learn, menu) : null;
  };
  return { menu, picks, mood, scoreOf };
}
