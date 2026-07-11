"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const EMAIL = "demo@bracket.test";
const PASSWORD = "password";

export function DemoCallout() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${EMAIL} / ${PASSWORD}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the credentials are visible anyway */
    }
  }

  return (
    <div className="mt-5 rounded-md border border-line-2 bg-surface-2/60 p-3.5">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-amber">
          <span className="mr-1.5">◆</span>Demo organizer
        </p>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-sm border border-line-2 px-2.5 py-1 font-mono text-[11px] text-ink-dim transition-colors duration-150 hover:border-amber-line hover:text-amber-ink"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
        <dt className="text-ink-mute">email</dt>
        <dd className="text-ink-dim">{EMAIL}</dd>
        <dt className="text-ink-mute">pass</dt>
        <dd className="text-ink-dim">{PASSWORD}</dd>
      </dl>
    </div>
  );
}
