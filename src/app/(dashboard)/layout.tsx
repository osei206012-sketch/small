import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TOOLS, PLANS, type PlanId } from "@/lib/plans";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

const NAV = [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }, ...TOOLS.map((t) => ({ href: t.href, label: t.name, icon: t.icon }))];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const plan = (user.plan as PlanId) || "free";
  const planName = PLANS[plan].name;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">⚡</span>
            BizTools
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">{user.email}</span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {planName} plan
            </span>
            <Link
              href="/pricing"
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              {plan === "free" ? "Upgrade" : "Manage plan"}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <LogoutButton />
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
