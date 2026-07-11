"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 4500,
        style: {
          maxWidth: "380px",
          padding: "11px 14px",
          borderRadius: "11px",
          border: "1px solid var(--color-line-2)",
          background: "var(--color-surface-2)",
          color: "var(--color-ink)",
          fontSize: "13.5px",
          lineHeight: "1.45",
          boxShadow: "0 12px 30px -12px rgba(0, 0, 0, 0.7)",
        },
        error: {
          iconTheme: { primary: "var(--color-loss)", secondary: "var(--color-surface-2)" },
          style: { border: "1px solid var(--color-loss)" },
        },
        success: {
          iconTheme: { primary: "var(--color-win)", secondary: "var(--color-surface-2)" },
        },
      }}
    />
  );
}
