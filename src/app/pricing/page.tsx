import Link from "next/link";
import { Navbar, Footer } from "@/components/site-chrome";
import { PLANS, PLAN_ORDER, planPrice } from "@/lib/plans";
import { Button } from "@/components/ui";

export const metadata = { title: "Pricing — BizTools" };

export default function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  return <PricingContent searchParams={searchParams} />;
}

async function PricingContent({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  const { interval } = await searchParams;
  const activeInterval = interval === "yearly" ? "yearly" : "monthly";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Pricing</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            One subscription unlocks the whole toolbox. Switch or cancel anytime.
          </p>
          <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <Link
              href="/pricing?interval=monthly"
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeInterval === "monthly" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Monthly
            </Link>
            <Link
              href="/pricing?interval=yearly"
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                activeInterval === "yearly" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Yearly (save 17%)
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const price = planPrice(id, activeInterval);
            const highlighted = id === "pro";
            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                  highlighted ? "border-indigo-500 ring-2 ring-indigo-500" : "border-slate-200"
                }`}
              >
                {highlighted ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">${price}</span>
                  <span className="text-sm text-slate-500">
                    /{activeInterval === "yearly" ? "yr" : "mo"}
                  </span>
                </div>
                {id === "free" ? (
                  <p className="mt-1 text-xs text-slate-500">Free forever</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    {activeInterval === "yearly" ? "Billed annually" : "Billed monthly"}
                  </p>
                )}
                <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/register?plan=${id}&interval=${activeInterval}`} className="mt-6 block">
                  <Button variant={highlighted ? "primary" : "outline"} className="w-full">
                    {plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          <h2 className="font-semibold text-slate-900">What&apos;s included?</h2>
          <p className="mt-2">
            Every paid plan includes unlimited use of the unlocked tools, saved documents in your
            account, and print/PDF export. The Business plan adds the stock management dashboard.
            Prices are in USD and shown for demonstration — checkout is simulated.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
