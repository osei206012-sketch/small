import Link from "next/link";
import { Navbar, Footer } from "@/components/site-chrome";
import { TOOLS, PLANS, PLAN_ORDER, planPrice } from "@/lib/plans";
import { Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(99,102,241,0.25),transparent)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            ⚡ One subscription, six business tools
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Run your business with{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              automated tools
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Stop hiring someone to do the maths, the paperwork and the stock counts.
            BizTools gives you calculators, invoice, flyer, CV and inventory tools —
            you subscribe and use them yourself.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Start free — no card required</Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="outline">View pricing</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Free plan includes the construction & profit calculators.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything in one place</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Six tools that small businesses actually need — built to be used by you, not by an employee.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{tool.icon}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {PLANS[tool.required].name}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
                {tool.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{tool.description}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Three steps between you and a smoother business.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Create an account", d: "Sign up for free in under a minute. No credit card needed to start." },
              { n: "2", t: "Pick a plan", d: "Upgrade to Pro or Business when you need documents and inventory tools." },
              { n: "3", t: "Use the tools", d: "Calculate, generate, print and track — everything is saved to your account." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Simple pricing</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            One subscription unlocks the whole toolbox. Cancel anytime.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const highlighted = id === "pro";
            return (
              <div
                key={id}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
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
                  <span className="text-4xl font-bold text-slate-900">${plan.monthly}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  or ${plan.yearly}/year (2 months free)
                </p>
                <ul className="mt-6 space-y-2 text-sm text-slate-600">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/register?plan=${id}`} className="mt-6 block">
                  <Button variant={highlighted ? "primary" : "outline"} className="w-full">
                    {plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to automate your business?</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Join thousands of small business owners using BizTools every day.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="secondary">Create free account</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">See plans</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
