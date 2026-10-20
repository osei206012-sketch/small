import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Item {
  description: string;
  qty: number;
  price: number;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, user.id))
    .orderBy(desc(invoices.createdAt))
    .limit(100);
  return NextResponse.json({ invoices: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const items = (body.items as Item[]) || [];
    const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
    const taxRate = Number(body.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const [row] = await db
      .insert(invoices)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        type: body.type === "quote" ? "quote" : "invoice",
        number: String(body.number || `INV-${Date.now()}`),
        clientName: String(body.clientName || "Client"),
        clientEmail: body.clientEmail ? String(body.clientEmail) : null,
        clientAddress: body.clientAddress ? String(body.clientAddress) : null,
        issueDate: body.issueDate ? String(body.issueDate) : null,
        dueDate: body.dueDate ? String(body.dueDate) : null,
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: body.status || "draft",
        notes: body.notes ? String(body.notes) : null,
      })
      .returning();
    return NextResponse.json({ invoice: row }, { status: 201 });
  } catch (err) {
    console.error("invoice create", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
