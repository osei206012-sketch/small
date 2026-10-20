import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, stockItems, cvs, flyers, estimates } from "@/db/schema";
import { requireUser } from "@/lib/access";
import { TOOLS, PLANS, type PlanId, canAccess } from "@/lib/plans";
import { Card, Badge, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const plan = (user.plan as PlanId) || "free";

  const uid = user.id;
  const [invCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.userId, uid));
  const [stockCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(stockItems)
    .where(eq(stockItems.userId, uid));
  const [cvCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(cvs)
    .where(eq(cvs.userId, uid));
  const [flyerCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(flyers)
    .where(eq(flyers.userId, uid));
  const [estCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(estimates)
    .where(eq(estimates.userId, uid));

  const stats = [
    { label: "Invoices & quotes", value: invCount.c, href: "/tools/invoice-generator", icon: "🧾" },
    { label: "Stock items", value: stockCount.c, href: "/tools/stock-management", icon: "📦" },
    { label: "Saved CVs", value: cvCount.c, href: "/tools/cv-generator", icon: "📄" },
    { label: "Saved flyers", value: flyerCount.c, href: "/tools/flyer-generator", icon: "🎨" },
    { label: "Cost estimates", value: estCount.c, href: "/tools/construction-calculator", icon: "🏗️" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">
            You&apos;re on the <span className="font-semibold">{PLANS[plan].name}</span> plan.
            {user.subscriptionEndsAt
              ? ` Renews ${new Date(user.subscriptionEndsAt).toLocaleDateString()}.`
              : ""}
          </p>
        </div>
        {plan === "free" ? (
          <Link href="/pricing">
            <Button>Upgrade to unlock all tools</Button>
          </Link>
        ) : (
          <Badge tone="green">Subscription active</Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-2xl font-bold text-slate-900">{s.value}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tools */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const locked = !canAccess(plan, tool.id);
            return (
              <Link
                key={tool.id}
                href={locked ? `/upgrade?tool=${tool.id}&plan=${tool.required}` : tool.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tool.icon}</span>
                  {locked ? (
                    <Badge tone="amber">{PLANS[tool.required].name} required</Badge>
                  ) : (
                    <Badge tone="green">Unlocked</Badge>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-indigo-600">
                  {tool.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
