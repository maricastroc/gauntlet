import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/PageHeading";
import { ConsoleScreen } from "@/components/console/ConsoleScreen";
import { getConsoleScenario } from "@/lib/data";

export const metadata: Metadata = { title: "Console" };

export default function ConsolePage() {
  const scenario = getConsoleScenario();

  return (
    <div className="pb-8">
      <PageHeading
        eyebrow={`Console · Group ${scenario.groupName}`}
        title="Edit a result"
        subtitle="Adjust the score and watch the consequence recalculate — tiebreak and standings — before it's saved."
      />
      <ConsoleScreen scenario={scenario} />
    </div>
  );
}
