"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { ApiError } from "@/lib/api/client";
import { AuthField } from "@/components/auth/AuthField";
import { AuthError, AuthShell, AuthSubmit } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const { register, status } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const destination = () => new URLSearchParams(window.location.search).get("from") || "/";

  useEffect(() => {
    if (status === "authed") router.replace(destination());
  }, [status, router]);

  const valid = name.trim().length > 0 && /.+@.+\..+/.test(email) && password.length >= 8;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(name.trim(), email.trim(), password);
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
      title="Create account"
      subtitle="Set up an organizer account to run your own tournaments — enter results and keep the table coherent."
    >
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <AuthField
          label="Name"
          type="text"
          value={name}
          autoComplete="name"
          placeholder="Your name"
          icon={User}
          onChange={setName}
        />
        <AuthField
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          onChange={setEmail}
        />
        <div className="flex flex-col gap-1.5">
          <AuthField
            label="Password"
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={Lock}
            onChange={setPassword}
          />
          <span
            className={`font-mono text-[10.5px] ${
              password.length === 0 || password.length >= 8 ? "text-ink-mute" : "text-loss"
            }`}
          >
            {password.length > 0 && password.length < 8
              ? `${8 - password.length} more character${8 - password.length === 1 ? "" : "s"} needed`
              : "8 characters minimum"}
          </span>
        </div>

        {error && <AuthError message={error} />}

        <AuthSubmit disabled={submitting || !valid}>
          {submitting ? "Creating account…" : "Create account"}
        </AuthSubmit>
      </form>

      <p className="mt-5 text-[13px] text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-ink hover:underline">
          Sign in
        </Link>
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
