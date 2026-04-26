import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback, useEffect } from "react";
import { formatLocalDayKey, parseLocalDayKey } from "../lib/dateUtils";

function msUntilNextLocalMidnight(now: Date): number {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

/**
 * Selected calendar day for Home + sidebar calendar, synced to `?day=YYYY-MM-DD`.
 */
export function useDayParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("day");

  const dayKey = useMemo(() => {
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return formatLocalDayKey(new Date());
  }, [raw]);

  useEffect(() => {
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      setSearchParams({ day: formatLocalDayKey(new Date()) }, { replace: true });
    }
  }, [raw, setSearchParams]);

  useEffect(() => {
    const now = new Date();
    const todayKey = formatLocalDayKey(now);

    if (dayKey !== todayKey) return;

    const timeoutId = window.setTimeout(() => {
      setSearchParams({ day: formatLocalDayKey(new Date()) }, { replace: true });
    }, msUntilNextLocalMidnight(now) + 1000);

    return () => window.clearTimeout(timeoutId);
  }, [dayKey, setSearchParams]);

  const setDayFromDate = useCallback(
    (d: Date) => {
      setSearchParams({ day: formatLocalDayKey(d) }, { replace: true });
    },
    [setSearchParams],
  );

  const selectedDate = useMemo(() => parseLocalDayKey(dayKey), [dayKey]);

  return { dayKey, selectedDate, setDayFromDate };
}
