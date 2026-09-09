"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { notifyApiError, notifySuccess } from "@/lib/toast";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell, AuthSubmit } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const { register, status } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedSample, setSeedSample] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const destination = () => new URLSearchParams(window.location.search).get("from") || "/";

  useEffect(() => {
    if (status === "authed") router.replace(destination());
  }, [status, router]);

  const valid = name.trim().length > 0 && /.+@.+\..+/.test(email) && password.length >= 8;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await register(name.trim(), email.trim(), password, seedSample);
      notifySuccess(
        seedSample
          ? `Welcome, ${user.name.split(/\s+/)[0]} — your account and sample tournament are ready.`
          : `Welcome, ${user.name.split(/\s+/)[0]} — your account is ready.`,
      );
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

        <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-line-2 bg-surface-2/40 px-3.5 py-3 text-[13px] text-ink-dim transition-colors hover:border-amber-line/60">
          <input
            type="checkbox"
            checked={seedSample}
            onChange={(e) => setSeedSample(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-amber"
          />
          <span>
            Start with a sample tournament
            <span className="text-ink-mute">
              {" "}
              — a prefilled Atlas Cup 2026, yours to explore and edit.
            </span>
          </span>
        </label>

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
