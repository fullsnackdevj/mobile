import { useMemo } from 'react';
import { recommend, scoreItem } from './recommend';
import { useCurrentMenu, useStore } from './store';

export function usePicks() {
  const menu = useCurrentMenu();
  const taste = useStore((s) => s.taste);
  const dislikes = useStore((s) => s.dislikes);
  const mood = useStore((s) => s.mood);
  const history = useStore((s) => s.history);
  const learn = useStore((s) => s.privacy.learn);
  const picks = useMemo(() => (menu ? recommend(menu.items, taste, dislikes, mood, history, learn) : null), [menu, taste, dislikes, mood, history, learn]);
  const scoreOf = (itemId: string) => {
    const i = menu?.items.find((x) => x.id === itemId);
    return i ? scoreItem(i, taste, mood, history, learn) : null;
  };
  return { menu, picks, mood, scoreOf };
}
