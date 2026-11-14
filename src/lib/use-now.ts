// A clock that re-renders once a minute, on the minute.
//
// The schedule board reads `new Date()` during render with no ticker, because
// nothing on it changes minute to minute. The shuttle countdown does, so the
// bus panel subscribes to this instead. Timers do not run while the app is in
// the background, so it also re-reads the time when the app comes back to the
// foreground — otherwise a countdown opened from the recents screen would show
// whatever it said when the phone was last put down.
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const current = new Date();
      // Wake just after the next minute boundary, not 60s from now, so the
      // countdown changes when the phone's own clock does.
      const untilNextMinute = 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds()) + 50;
      timer = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, untilNextMinute);
    };
    schedule();

    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      clearTimeout(timer);
      setNow(new Date());
      schedule();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return now;
}
