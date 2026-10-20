import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, planPrice, type PlanId, type Interval } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const history = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.startedAt))
    .limit(20);

  return NextResponse.json({
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt,
    history,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const planParam = String(body.plan || "");
    const intervalParam = String(body.interval || "monthly");
    if (!(planParam in PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const plan = planParam as PlanId;
    const interval: Interval = intervalParam === "yearly" ? "yearly" : "monthly";

    // Demo checkout: simulate a successful payment.
    const amount = planPrice(plan, interval);
    const startsAt = new Date();
    const endsAt =
      plan === "free"
        ? null
        : new Date(startsAt.getTime() + (interval === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000);

    // Close any active subscriptions.
    await db
      .update(subscriptions)
      .set({ status: "canceled" })
      .where(eq(subscriptions.userId, user.id));

    const subId = crypto.randomUUID();
    await db.insert(subscriptions).values({
      id: subId,
      userId: user.id,
      plan,
      status: "active",
      interval,
      amount,
      startedAt: startsAt,
      endsAt,
    });

    await db
      .update(users)
      .set({
        plan,
        subscriptionStatus: "active",
        subscriptionEndsAt: endsAt,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      ok: true,
      plan,
      interval,
      amount,
      endsAt,
      message: "Subscription activated (demo checkout — no real payment was processed).",
    });
  } catch (err) {
    console.error("subscribe error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
