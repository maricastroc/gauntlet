import { CloudOff } from "lucide-react";

export function ApiStatusBanner({ sources }: { sources: string[] }) {
  return (
    <div
      role="status"
      data-testid="api-status-banner"
      data-sources={sources.join(",")}
      className="flex items-start gap-2.5 border-b border-loss/30 bg-loss/10 px-5 py-2.5 text-[13px] text-ink-dim sm:px-6"
    >
      <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-loss" aria-hidden="true" />
      <span>
        <b className="font-semibold text-ink">Live data unavailable.</b> The tournament API
        couldn&apos;t be reached, so this is the offline sample — nothing here reflects a real
        result, and edits won&apos;t save.
      </span>
    </div>
  );
}
