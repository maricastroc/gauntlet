import { cookies } from "next/headers";
import { ApiError, api } from "@/lib/api/client";
import { CURRENT_TOURNAMENT_COOKIE, DEMO_TOURNAMENT_ID } from "./constants";

export { CURRENT_TOURNAMENT_COOKIE, DEMO_TOURNAMENT_ID } from "./constants";

const LIVE_ENABLED = process.env.NEXT_PUBLIC_USE_LIVE_API !== "false";

export async function getCurrentTournamentId(): Promise<number> {
  const store = await cookies();
  const raw = store.get(CURRENT_TOURNAMENT_COOKIE)?.value;
  const id = raw ? Number(raw) : Number.NaN;

  if (Number.isInteger(id) && id > 0 && (!LIVE_ENABLED || (await tournamentExists(id)))) {
    return id;
  }

  // The default (no/invalid selection) is the live demo template, not a hard-coded id.
  return (LIVE_ENABLED ? await api.demoTemplateId() : null) ?? DEMO_TOURNAMENT_ID;
}

async function tournamentExists(id: number): Promise<boolean> {
  try {
    await api.getTournament(id);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return false;
    return true;
  }
}
