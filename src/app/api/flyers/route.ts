import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { flyers } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(flyers)
    .where(eq(flyers.userId, user.id))
    .orderBy(desc(flyers.updatedAt))
    .limit(50);
  return NextResponse.json({ flyers: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body.title || "Untitled flyer").trim();
    const data = body.data ?? {};
    const [row] = await db
      .insert(flyers)
      .values({ id: crypto.randomUUID(), userId: user.id, title, data })
      .returning();
    return NextResponse.json({ flyer: row }, { status: 201 });
  } catch (err) {
    console.error("flyer create", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
