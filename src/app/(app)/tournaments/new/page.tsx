"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/ui/PageHeading";
import { NameStep } from "@/components/tournaments/NameStep";
import { TeamsStep } from "@/components/tournaments/TeamsStep";
import { GroupsStep } from "@/components/tournaments/GroupsStep";
import { Steps } from "@/components/tournaments/wizard";
import { api, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { setCurrentTournamentCookie } from "@/lib/tournament/select";
import {
  groupOptions,
  isBracketValid,
  GROUP_LETTERS,
  SUGGESTED,
  type DraftTeam,
} from "@/lib/tournament/draft";
import type { Team } from "@/lib/types";

export default function NewTournamentPage() {
  const { status, token } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [drafts, setDrafts] = useState<DraftTeam[]>(SUGGESTED);
  const [created, setCreated] = useState<Team[]>([]);
  const [numGroups, setNumGroups] = useState(4);
  const [qualifyCount, setQualifyCount] = useState(2);
  const [withKnockout, setWithKnockout] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "authed" || !token) {
    return (
      <div className="pb-10">
        <PageHeading eyebrow="Organizer" title="New tournament" />
        <div className="px-5 sm:px-6">
          <div className="rounded-[11px] border border-dashed border-line-2 px-5 py-8 text-[14px] text-ink-dim">
            You need to{" "}
            <Link href="/login?from=/tournaments/new" className="text-amber-ink hover:underline">
              sign in
            </Link>{" "}
            to build a tournament.
          </div>
        </div>
      </div>
    );
  }

  const validCount = drafts.map((d) => d.name.trim()).filter(Boolean).length;
  const bracketValid = isBracketValid(numGroups, qualifyCount);

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.displayMessage : "Could not reach the API.");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function createAndContinue() {
    const summary = await run(() => api.createTournament(token!, name.trim()));
    if (summary) {
      setTournamentId(summary.id);
      setStep(2);
    }
  }

  async function addTeamsAndContinue() {
    const payload = drafts
      .filter((d) => d.name.trim())
      .map((d) => ({ name: d.name.trim(), flag: d.flag || undefined }));
    const teams = await run(() => api.addTeams(token!, tournamentId!, payload));
    if (teams) {
      setCreated(teams);
      const options = groupOptions(teams.length);
      setNumGroups(options.includes(4) ? 4 : (options[options.length - 1] ?? 2));
      setStep(3);
    }
  }

  async function generate(teamIdsByGroup: number[][]) {
    const groups = teamIdsByGroup.map((teamIds, index) => ({
      name: GROUP_LETTERS[index],
      teamIds,
    }));

    const built = await run(async () => {
      await api.buildGroupStage(token!, tournamentId!, { qualifyCount, groups });
      if (withKnockout && bracketValid) {
        await api.buildKnockout(token!, tournamentId!);
      }
      return true;
    });

    if (built) {
      setCurrentTournamentCookie(tournamentId!);
      router.push("/console");
      router.refresh();
    }
  }

  return (
    <div className="pb-10">
      <PageHeading
        eyebrow={`Organizer · Step ${step} of 3`}
        title="New tournament"
        subtitle="Name it, add the teams, split them into groups — we generate the fixtures and the bracket."
      />

      <div className={`${step === 1 ? "max-w-[720px]" : "max-w-[960px]"} px-5 pt-4 sm:px-6`}>
        <Steps step={step} />

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-[9px] border border-loss/35 bg-loss/[0.08] px-3.5 py-2.5 text-[13px] text-loss"
          >
            {error}
          </p>
        )}

        {step === 1 && (
          <NameStep name={name} onNameChange={setName} busy={busy} onSubmit={createAndContinue} />
        )}

        {step === 2 && (
          <TeamsStep
            drafts={drafts}
            setDrafts={setDrafts}
            validCount={validCount}
            busy={busy}
            onSubmit={addTeamsAndContinue}
          />
        )}

        {step === 3 && (
          <GroupsStep
            key={numGroups}
            teams={created}
            numGroups={numGroups}
            setNumGroups={setNumGroups}
            qualifyCount={qualifyCount}
            setQualifyCount={setQualifyCount}
            withKnockout={withKnockout}
            setWithKnockout={setWithKnockout}
            bracketValid={bracketValid}
            busy={busy}
            onSubmit={generate}
          />
        )}
      </div>
    </div>
  );
}
