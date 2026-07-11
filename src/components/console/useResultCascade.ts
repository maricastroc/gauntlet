"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScenarioProjection } from "@/lib/types";
import { projectScenario } from "@/lib/data/scenario";
import { describeCascade, type CascadeStep } from "@/lib/whatif/cascade";

export function useResultCascade(tournamentId: number, enabled: boolean) {
  const baseline = useRef<ScenarioProjection | null>(null);
  const requestId = useRef(0);
  const [steps, setSteps] = useState<CascadeStep[]>([]);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    projectScenario(tournamentId, [])
      .then((projection) => {
        if (active && baseline.current === null) baseline.current = projection;
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [tournamentId, enabled]);

  const report = useCallback(async () => {
    if (!enabled) return;
    const id = ++requestId.current;
    let next: ScenarioProjection;
    try {
      next = await projectScenario(tournamentId, []);
    } catch {
      return;
    }
    if (id !== requestId.current) return; // a newer save superseded this one

    const previous = baseline.current;
    baseline.current = next;
    if (previous) {
      setSteps(describeCascade(previous, next));
      setNonce((value) => value + 1);
    }
  }, [tournamentId, enabled]);

  const dismiss = useCallback(() => setSteps([]), []);

  return { steps, nonce, report, dismiss };
}
