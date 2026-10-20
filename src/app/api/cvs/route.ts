import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(cvs)
    .where(eq(cvs.userId, user.id))
    .orderBy(desc(cvs.updatedAt))
    .limit(50);
  return NextResponse.json({ cvs: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body.title || "Untitled CV").trim();
    const data = body.data ?? {};
    const [row] = await db
      .insert(cvs)
      .values({ id: crypto.randomUUID(), userId: user.id, title, data })
      .returning();
    return NextResponse.json({ cv: row }, { status: 201 });
  } catch (err) {
    console.error("cv create", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
