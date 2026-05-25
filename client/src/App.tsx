import { useEffect, useState } from "react";
import { env } from "./config/env";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; status: string; uptime: number }
  | { kind: "error"; message: string };

export function App() {
  const [health, setHealth] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`${env.serverOrigin}/health`, { credentials: "include" })
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (body?.success && body?.data) {
          setHealth({
            kind: "ok",
            status: body.data.status,
            uptime: body.data.uptime,
          });
        } else {
          setHealth({ kind: "error", message: "Unexpected response shape" });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Request failed";
        setHealth({ kind: "error", message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <section className="w-full max-w-[400px] rounded-lg border border-border-subtle bg-bg-surface p-10">
        <h1 className="text-xl font-semibold tracking-tight">Stratum CMS</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Phase 0 — frontend to backend handshake
        </p>

        <div className="mt-6 rounded-md bg-bg-muted p-4">
          {health.kind === "loading" && (
            <p className="text-sm text-text-tertiary">Checking backend…</p>
          )}

          {health.kind === "ok" && (
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Backend connected
                </p>
                <p className="text-xs text-text-tertiary">
                  status: {health.status} · uptime: {health.uptime.toFixed(1)}s
                </p>
              </div>
            </div>
          )}

          {health.kind === "error" && (
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
              <div>
                <p className="text-sm font-medium text-danger-500">
                  Backend unreachable
                </p>
                <p className="text-xs text-text-tertiary">{health.message}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
