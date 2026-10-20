import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(stockItems)
    .where(eq(stockItems.userId, user.id))
    .orderBy(desc(stockItems.updatedAt))
    .limit(500);
  return NextResponse.json({ items: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    const [row] = await db
      .insert(stockItems)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        sku: body.sku ? String(body.sku) : null,
        category: body.category ? String(body.category) : null,
        quantity: Number(body.quantity || 0),
        unitCost: Number(body.unitCost || 0),
        unitPrice: Number(body.unitPrice || 0),
        reorderLevel: Number(body.reorderLevel || 0),
        location: body.location ? String(body.location) : null,
      })
      .returning();
    return NextResponse.json({ item: row }, { status: 201 });
  } catch (err) {
    console.error("stock create", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
