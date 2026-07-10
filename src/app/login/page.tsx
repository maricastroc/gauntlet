"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ApiError } from "@/lib/api/client";
import { AuthField } from "@/components/auth/AuthField";
import { AuthError, AuthShell, AuthSubmit } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("demo@bracket.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = () =>
    new URLSearchParams(window.location.search).get("from") || "/";

  useEffect(() => {
    if (status === "authed") router.replace(destination());
  }, [status, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.replace(destination());
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.displayMessage : "Could not reach the API.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Organizer access"
      title="Sign in"
      subtitle="Reading a tournament is public. Signing in unlocks the organizer console — saving and editing results."
    >
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <AuthField
          label="Email"
          type="email"
          value={email}
          autoComplete="username"
          onChange={setEmail}
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={setPassword}
        />

        {error && <AuthError message={error} />}

        <AuthSubmit disabled={submitting || !password}>
          {submitting ? "Signing in…" : "Sign in"}
        </AuthSubmit>
      </form>

      <p className="mt-5 text-[13px] text-ink-dim">
        New here?{" "}
        <Link href="/register" className="text-amber-ink hover:underline">
          Create an organizer account
        </Link>
      </p>

      <p className="mt-4 flex items-center gap-2 rounded-[9px] border border-dashed border-line-2 px-3.5 py-2.5 font-mono text-[11.5px] text-ink-mute">
        <span className="text-amber">◆</span>
        Demo organizer — <span className="text-ink-dim">demo@bracket.test</span> ·{" "}
        <span className="text-ink-dim">password</span>
      </p>

      <Link
        href="/"
        className="mt-6 inline-block text-[13px] text-ink-mute transition-colors hover:text-ink-dim"
      >
        ← Back to the tournament
      </Link>
    </AuthShell>
  );
}
