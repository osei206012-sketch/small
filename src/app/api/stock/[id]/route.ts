import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const [row] = await db
      .update(stockItems)
      .set({
        ...(body.name !== undefined ? { name: String(body.name) } : {}),
        ...(body.sku !== undefined ? { sku: body.sku ? String(body.sku) : null } : {}),
        ...(body.category !== undefined ? { category: body.category ? String(body.category) : null } : {}),
        ...(body.quantity !== undefined ? { quantity: Number(body.quantity) } : {}),
        ...(body.unitCost !== undefined ? { unitCost: Number(body.unitCost) } : {}),
        ...(body.unitPrice !== undefined ? { unitPrice: Number(body.unitPrice) } : {}),
        ...(body.reorderLevel !== undefined ? { reorderLevel: Number(body.reorderLevel) } : {}),
        ...(body.location !== undefined ? { location: body.location ? String(body.location) : null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(stockItems.id, id), eq(stockItems.userId, user.id)))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: row });
  } catch (err) {
    console.error("stock update", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.delete(stockItems).where(and(eq(stockItems.id, id), eq(stockItems.userId, user.id)));
  return NextResponse.json({ ok: true });
}
