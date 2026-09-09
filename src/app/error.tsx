"use client";

import { useEffect } from "react";
import { ErrorAction, ErrorState } from "@/components/ui/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh">
      <ErrorState
        eyebrow="Something broke"
        title="This page couldn't be rendered."
        actions={
          <>
            <ErrorAction tone="primary" onClick={reset}>
              Try again
            </ErrorAction>
            <ErrorAction href="/">Back to the tournament</ErrorAction>
          </>
        }
      >
        <p>
          The tournament data couldn&apos;t be loaded. If the API is deployed, it may be waking up —
          retrying usually settles it.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[12px] text-ink-mute">reference {error.digest}</p>
        )}
      </ErrorState>
    </main>
  );
}
