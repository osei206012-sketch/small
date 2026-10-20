import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const planParam = String(body.plan || "free");
    const plan = (planParam in PLANS ? planParam : "free") as PlanId;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    // If they signed up for a paid plan directly, start a trial subscription.
    const isPaid = plan !== "free";
    const endsAt = isPaid
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      : null;

    await db.insert(users).values({
      id,
      email,
      name,
      passwordHash: hashPassword(password),
      plan,
      subscriptionStatus: isPaid ? "active" : "active",
      subscriptionEndsAt: endsAt,
    });

    const token = createSessionToken(id);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, plan }, { status: 201 });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
