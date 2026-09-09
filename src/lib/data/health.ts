import { cache } from "react";

export interface LiveHealth {
  degraded: boolean;
  sources: string[];
}

const store = cache((): LiveHealth => ({ degraded: false, sources: [] }));

export function markLiveDegraded(source: string): void {
  const health = store();
  health.degraded = true;
  if (!health.sources.includes(source)) {
    health.sources.push(source);
  }
}

export function liveHealth(): LiveHealth {
  const health = store();
  return { degraded: health.degraded, sources: [...health.sources] };
}
