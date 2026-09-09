import type { Metadata } from "next";
import { ErrorAction, ErrorState } from "@/components/ui/ErrorState";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <ErrorState
        eyebrow="404"
        title="No such page."
        actions={
          <>
            <ErrorAction tone="primary" href="/">
              Back to the tournament
            </ErrorAction>
            <ErrorAction href="/tournaments">Browse tournaments</ErrorAction>
          </>
        }
      >
        <p>
          That route isn&apos;t part of the app. The tournament, group or tie you were after may
          have been renamed or deleted.
        </p>
      </ErrorState>
    </main>
  );
}
