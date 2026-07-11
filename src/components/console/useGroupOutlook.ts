"use client";

import { useEffect, useState } from "react";
import { forecastGroup, type GroupForecast, type GroupSim } from "@/lib/forecast/groups";

const DELAY = 250;

export function useGroupOutlook(sim: GroupSim): GroupForecast | null {
  const [forecast, setForecast] = useState<GroupForecast | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setForecast(forecastGroup(sim)), DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sim.key encodes the inputs
  }, [sim.key]);

  return forecast;
}
