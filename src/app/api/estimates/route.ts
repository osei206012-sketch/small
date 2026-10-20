import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { estimates } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(estimates)
    .where(eq(estimates.userId, user.id))
    .orderBy(desc(estimates.createdAt))
    .limit(50);
  return NextResponse.json({ estimates: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const projectName = String(body.projectName || "Untitled project").trim();
    const data = body.data ?? {};
    const totalCost = Number(body.totalCost || 0);
    const [row] = await db
      .insert(estimates)
      .values({ id: crypto.randomUUID(), userId: user.id, projectName, data, totalCost })
      .returning();
    return NextResponse.json({ estimate: row }, { status: 201 });
  } catch (err) {
    console.error("estimate create", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
