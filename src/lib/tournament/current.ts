import { cookies } from "next/headers";
import { ApiError, api } from "@/lib/api/client";
import { CURRENT_TOURNAMENT_COOKIE, DEMO_TOURNAMENT_ID } from "./constants";
import { markLiveDegraded } from "@/lib/data/health";

export { CURRENT_TOURNAMENT_COOKIE, DEMO_TOURNAMENT_ID } from "./constants";

const LIVE_ENABLED = process.env.NEXT_PUBLIC_USE_LIVE_API !== "false";

export async function getCurrentTournamentId(): Promise<number> {
  const store = await cookies();
  const raw = store.get(CURRENT_TOURNAMENT_COOKIE)?.value;
  const id = raw ? Number(raw) : Number.NaN;

  if (Number.isInteger(id) && id > 0 && (!LIVE_ENABLED || (await tournamentExists(id)))) {
    return id;
  }

  return (LIVE_ENABLED ? await demoTemplateId() : null) ?? DEMO_TOURNAMENT_ID;
}

async function demoTemplateId(): Promise<number | null> {
  try {
    return await api.demoTemplateId();
  } catch {
    markLiveDegraded("demo template");
    return null;
  }
}

async function tournamentExists(id: number): Promise<boolean> {
  try {
    await api.getTournament(id);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return false;
    markLiveDegraded("tournament lookup");
    return true;
  }
}
