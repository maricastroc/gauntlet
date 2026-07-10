import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { Bracket } from "@/components/bracket/Bracket";
import { BracketLegend } from "@/components/bracket/BracketLegend";
import { getBracket } from "@/lib/data";

export const metadata: Metadata = { title: "Chaveamento" };

export default function BracketPage() {
  const bracket = getBracket();

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
