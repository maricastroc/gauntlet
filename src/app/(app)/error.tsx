"use client";

import { useEffect } from "react";
import { ErrorAction, ErrorState } from "@/components/ui/ErrorState";

export default function AppError({
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
    <ErrorState
      eyebrow="Something broke"
      title="This screen couldn't be loaded."
      actions={
        <>
          <ErrorAction tone="primary" onClick={reset}>
            Try again
          </ErrorAction>
          <ErrorAction href="/">Back to the overview</ErrorAction>
        </>
      }
    >
      <p>
        The engine couldn&apos;t assemble this view. Nothing was saved or lost — retry, or head back
        to the overview.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[12px] text-ink-mute">reference {error.digest}</p>
      )}
    </ErrorState>
  );
}
