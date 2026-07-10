import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { Bracket } from "@/components/bracket/Bracket";
import { BracketLegend } from "@/components/bracket/BracketLegend";
import { getBracket } from "@/lib/data";

export const metadata: Metadata = { title: "Bracket" };
export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const bracket = await getBracket();

  return (
    <div className="pb-4">
      <PageHeading
        eyebrow="Knockout"
        title="Bracket"
        subtitle="Every winner advances through the bracket — the path to the trophy, updated with each result."
        actions={<BracketLegend />}
      />
      <Bracket data={bracket} />
    </div>
  );
}
