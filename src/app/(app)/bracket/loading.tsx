import { PageHeading } from "@/components/ui/PageHeading";

export default function BracketLoading() {
  return (
    <div className="pb-4">
      <PageHeading
        eyebrow="Knockout"
        title="Bracket"
        subtitle="Tap any tie to enter the score — the winner advances through the bracket, all the way to the trophy."
      />
      <div className="grid gap-3 px-5 pt-4 sm:px-6 md:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, tie) => (
          <div
            key={tie}
            className="h-[92px] animate-pulse rounded-[13px] border border-line bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
