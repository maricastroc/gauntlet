import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { GroupCard } from "@/components/standings/GroupCard";
import { getGroups } from "@/lib/data";

export const metadata: Metadata = { title: "Standings" };
export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const groups = await getGroups();

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow="Group stage"
        title="Standings"
        subtitle="A live projection of the matches — points, goal difference and the qualification cut, always recalculated."
      />
      <div className="grid gap-5 px-5 pt-3 sm:px-6 lg:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
