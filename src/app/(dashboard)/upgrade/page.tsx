"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TOOLS, PLANS, PLAN_ORDER, planPrice, requiredPlanFor, type PlanId, type Interval } from "@/lib/plans";
import { Button, Card, Badge } from "@/components/ui";
import { formatMoney } from "@/lib/format";

function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolId = searchParams.get("tool") || "";
  const tool = TOOLS.find((t) => t.id === toolId);
  const required = (searchParams.get("plan") as PlanId) || requiredPlanFor(toolId);

  const [plan, setPlan] = useState<PlanId>(required in PLANS ? required : "pro");
  const [interval, setInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function subscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to subscribe");
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push(tool ? tool.href : "/dashboard");
        router.refresh();
      }, 900);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{tool?.icon ?? "🔒"}</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {tool ? `Unlock ${tool.name}` : "Upgrade your plan"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              This tool is included in the{" "}
              <span className="font-semibold text-indigo-600">{PLANS[required].name}</span> plan and above.
              Subscribe to start using it today.
            </p>
          </div>
        </div>

        {done ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ Subscription activated! Redirecting you to the tool…
          </div>
        ) : (
          <>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setInterval("monthly")}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold ${
                  interval === "monthly"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("yearly")}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold ${
                  interval === "yearly"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Yearly (save 17%)
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PLAN_ORDER.filter((p) => PLANS[p].rank >= PLANS[required].rank).map((id) => {
                const p = PLANS[id];
                const price = planPrice(id, interval);
                const selected = plan === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPlan(id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      {id === "pro" ? <Badge tone="indigo">Popular</Badge> : null}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {formatMoney(price, "$")}
                      <span className="text-sm font-normal text-slate-500">
                        /{interval === "yearly" ? "yr" : "mo"}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-xs text-slate-500">
                      {p.features.slice(0, 4).map((f) => (
                        <li key={f}>✓ {f}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
                ← Back to dashboard
              </Link>
              <Button onClick={subscribe} disabled={loading} size="lg">
                {loading
                  ? "Processing…"
                  : `Subscribe to ${PLANS[plan].name} — ${formatMoney(planPrice(plan, interval), "$")}/${interval === "yearly" ? "yr" : "mo"}`}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Demo checkout — no real payment is processed.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <UpgradePage />
    </Suspense>
  );
}
