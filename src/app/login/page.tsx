"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { notifyApiError } from "@/lib/toast";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell, AuthSubmit } from "@/components/auth/AuthShell";
import { DemoCallout } from "@/components/auth/DemoCallout";

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("demo@bracket.test");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = () => new URLSearchParams(window.location.search).get("from") || "/";

  useEffect(() => {
    if (status === "authed") router.replace(destination());
  }, [status, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(destination());
      router.refresh();
    } catch (err) {
      notifyApiError(err);
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Organizer access"
      title="Sign in"
      subtitle="Edit live scores and every standing, tiebreak and knockout slot recalculates instantly."
    >
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <AuthField
          label="Email"
          type="email"
          value={email}
          autoComplete="username"
          placeholder="you@example.com"
          icon={Mail}
          onChange={setEmail}
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          placeholder="Your password"
          icon={Lock}
          onChange={setPassword}
        />

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

      <DemoCallout />

      <Link
        href="/"
        className="mt-6 inline-block text-[13px] text-ink-mute transition-colors hover:text-ink-dim"
      >
        ← Continue as spectator
      </Link>
    </AuthShell>
  );
}
