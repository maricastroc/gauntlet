import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { ManageScreen } from "@/components/tournaments/ManageScreen";

export const metadata: Metadata = { title: "Manage tournament" };
export const dynamic = "force-dynamic";

export default async function ManageTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="pb-10">
      <PageHeading
        eyebrow="Organizer"
        title="Manage tournament"
        subtitle="Rename the tournament and its teams. Results, standings and the bracket stay intact."
      />
      <ManageScreen tournamentId={Number(id)} />
    </div>
  );
}
