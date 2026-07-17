"use client";

import { useState } from "react";

/**
 * Keep local draft search text in sync when the URL `q` param changes
 * (back/forward, clear filters) without syncing inside useEffect.
 * @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useUrlSyncedSearch(qParam: string) {
  const [search, setSearch] = useState(qParam);
  const [prevQParam, setPrevQParam] = useState(qParam);

  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearch(qParam);
  }

  return [search, setSearch] as const;
}
