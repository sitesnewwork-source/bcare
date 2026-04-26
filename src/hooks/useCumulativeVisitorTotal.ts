import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_TOTAL = "admin_cumulative_total";
const STORAGE_SEEN = "admin_seen_visitor_keys";
const MAX_SEEN_KEYS = 5000; // cap memory usage

/**
 * Tracks the all-time total number of unique visitors seen by the admin
 * dashboard. Unlike a live count, it does NOT decrease when visitors are
 * deleted from the table — it only resets when the admin explicitly clears
 * all data (call resetCumulativeTotal()).
 */
export function useCumulativeVisitorTotal(visitorIds: string[]) {
  const [total, setTotal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_TOTAL);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const seenRef = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem(STORAGE_SEEN) || "[]"))
  );

  useEffect(() => {
    if (!visitorIds.length) return;
    let added = 0;
    for (const id of visitorIds) {
      if (id && !seenRef.current.has(id)) {
        seenRef.current.add(id);
        added++;
      }
    }
    if (added > 0) {
      // Trim if too large
      if (seenRef.current.size > MAX_SEEN_KEYS) {
        const arr = Array.from(seenRef.current).slice(-MAX_SEEN_KEYS);
        seenRef.current = new Set(arr);
      }
      setTotal((prev) => {
        const next = prev + added;
        localStorage.setItem(STORAGE_TOTAL, String(next));
        localStorage.setItem(
          STORAGE_SEEN,
          JSON.stringify(Array.from(seenRef.current))
        );
        return next;
      });
    }
  }, [visitorIds]);

  const resetTotal = useCallback(() => {
    seenRef.current = new Set();
    localStorage.removeItem(STORAGE_TOTAL);
    localStorage.removeItem(STORAGE_SEEN);
    setTotal(0);
  }, []);

  return { total, resetTotal };
}
