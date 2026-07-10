import type { ReactNode } from "react";
import type { Bracket as BracketData, BracketTie } from "@/lib/types";
import { roundName } from "@/lib/format";
import { MatchCard } from "./MatchCard";
import { ChampionCard } from "./ChampionCard";
import { HEADER_SPACER, PairConnector, StraightConnector } from "./Connectors";

function groupByRound(ties: BracketTie[]): BracketTie[][] {
  const rounds = [...new Set(ties.map((tie) => tie.round))].sort((a, b) => a - b);
  return rounds.map((round) =>
    ties.filter((tie) => tie.round === round).sort((a, b) => a.slot - b.slot),
  );
}

function RoundHeader({ children }: { children: string }) {
  return (
    <div
      className={`${HEADER_SPACER} flex items-end justify-center border-b border-line pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-mute`}
    >
      {children}
    </div>
  );
}

function RoundColumn({
  matches,
  round,
  maxRound,
  renderCard,
}: {
  matches: BracketTie[];
  round: number;
  maxRound: number;
  renderCard: (tie: BracketTie) => ReactNode;
}) {
  return (
    <div className="flex w-[212px] shrink-0 flex-col">
      <RoundHeader>{roundName(round, maxRound)}</RoundHeader>
      <div className="flex flex-1 flex-col">
        {matches.map((tie) => (
          <div key={tie.id} className="flex flex-1 items-center py-2">
            <div className="w-full">{renderCard(tie)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BracketProps {
  data: BracketData;
  renderCard?: (tie: BracketTie) => ReactNode;
  championSlot?: ReactNode;
}

export function Bracket({ data, renderCard, championSlot }: BracketProps) {
  const rounds = groupByRound(data.ties);
  const maxRound = rounds.length;
  const card = renderCard ?? ((tie: BracketTie) => <MatchCard tie={tie} />);

  return (
    <div className="overflow-x-auto px-5 pb-8 pt-6 sm:px-6">
      <div className="flex min-w-[820px] items-stretch">
        {rounds.map((matches, index) => {
          const round = index + 1;
          const isLast = index === rounds.length - 1;
          const nextCount = rounds[index + 1]?.length ?? 0;
          return (
            <div key={round} className="flex items-stretch">
              <RoundColumn matches={matches} round={round} maxRound={maxRound} renderCard={card} />
              {!isLast && <PairConnector pairs={nextCount} />}
            </div>
          );
        })}

        <StraightConnector />
        <div className="flex w-[156px] shrink-0 flex-col">
          <div className={HEADER_SPACER} aria-hidden="true" />
          <div className="flex flex-1 items-center">
            <div className="w-full">
              {championSlot ?? <ChampionCard champion={data.champion} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
