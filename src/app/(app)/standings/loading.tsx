import { PageHeading } from "@/components/ui/PageHeading";

export default function StandingsLoading() {
  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Group stage"
        title="Standings"
        subtitle="A live projection of the matches — points, goal difference and the qualification cut, always recalculated."
      />
      <div className="space-y-4 px-5 pt-4 sm:px-6" aria-hidden="true">
        {Array.from({ length: 2 }).map((_, group) => (
          <div
            key={group}
            className="animate-pulse rounded-[13px] border border-line bg-white/[0.02] p-4"
          >
            <div className="h-4 w-20 rounded bg-white/[0.05]" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="h-6 rounded bg-white/[0.03]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
