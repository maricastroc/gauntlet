import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";
import { PlayableBracket } from "@/components/bracket/PlayableBracket";
import { GenerateBracket } from "@/components/bracket/GenerateBracket";
import { BracketLegend } from "@/components/bracket/BracketLegend";
import { TitleOdds } from "@/components/forecast/TitleOdds";
import { getBracket, getGroups } from "@/lib/data";
import { titleOddsFrom } from "@/lib/forecast/bracket";
import { getCurrentTournamentId } from "@/lib/tournament/current";

export const metadata: Metadata = { title: "Bracket" };
export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const tournamentId = await getCurrentTournamentId();
  const [bracket, groups] = await Promise.all([getBracket(tournamentId), getGroups(tournamentId)]);
  const titleOdds = titleOddsFrom(bracket, groups);

  const waiting =
    bracket.ties.length > 0 && bracket.ties.every((tie) => !tie.home.team && !tie.away.team);

  return (
    <div className="pb-4">
      <PageHeading
        eyebrow="Knockout"
        title="Bracket"
        subtitle="Tap any tie to enter the score — the winner advances through the bracket, all the way to the trophy."
        actions={bracket.ties.length > 0 ? <BracketLegend /> : undefined}
      />

      {waiting && (
        <div className="px-5 pt-4 sm:px-6">
          <Link
            href="/console"
            className="flex flex-wrap items-center justify-between gap-3 rounded-[11px] border border-amber-line bg-amber-soft px-4 py-3 text-[13.5px] text-amber-ink transition-colors duration-150 hover:brightness-110"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">◆</span>
              The bracket fills in once the groups are decided — enter results in the Console.
            </span>
            <span className="flex items-center gap-1 font-semibold">
              Open the Console
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      {bracket.ties.length > 0 ? (
        <>
          <TitleOdds odds={titleOdds} />
          <PlayableBracket initial={bracket} tournamentId={tournamentId} />
        </>
      ) : (
        <div className="px-5 pt-3 sm:px-6">
          {groups.length > 0 ? (
            <GenerateBracket tournamentId={tournamentId} />
          ) : (
            <div className="rounded-[11px] border border-dashed border-line-2 px-6 py-12 text-center text-[14px] text-ink-mute">
              No knockout bracket yet — set up the group stage first.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
