"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Field, Input, Select, Button, Badge } from "@/components/ui";
import { currencySymbol, formatMoney, formatNumber } from "@/lib/format";

interface StockItem {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  reorderLevel: number;
  location: string | null;
  updatedAt: string;
}

interface FormState {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  reorderLevel: number;
  location: string;
}

const emptyForm: FormState = {
  name: "", sku: "", category: "", quantity: 0, unitCost: 0, unitPrice: 0, reorderLevel: 0, location: "",
};

export function StockManagement() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [currency, setCurrency] = useState("USD");
  const [msg, setMsg] = useState<string | null>(null);

  const symbol = currencySymbol(currency);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    fetch("/api/stock")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[],
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((i) => {
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.sku || "").toLowerCase().includes(q) ||
        (i.category || "").toLowerCase().includes(q);
      const matchesCat = category === "all" || i.category === category;
      return matchesQuery && matchesCat;
    });
  }, [items, query, category]);

  const stats = useMemo(() => {
    const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    const potentialRevenue = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const lowStock = items.filter((i) => i.quantity <= i.reorderLevel).length;
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
    return { count: items.length, totalValue, potentialRevenue, lowStock, totalUnits };
  }, [items]);

  function startEdit(item: StockItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku || "",
      category: item.category || "",
      quantity: item.quantity,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      reorderLevel: item.reorderLevel,
      location: item.location || "",
    });
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim()) {
      setMsg("Item name is required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      category: form.category.trim() || null,
      quantity: Number(form.quantity) || 0,
      unitCost: Number(form.unitCost) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      location: form.location.trim() || null,
    };
    if (editingId) {
      const res = await fetch(`/api/stock/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg("Item updated.");
        cancelEdit();
        refresh();
      } else setMsg("Could not update item.");
    } else {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg("Item added.");
        setForm(emptyForm);
        refresh();
      } else setMsg("Could not add item.");
    }
  }

  async function remove(id: string) {
    await fetch(`/api/stock/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">📦 Stock Management</h1>
        <p className="text-sm text-slate-500">Track inventory, valuation and low-stock alerts.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Items" value={formatNumber(stats.count)} icon="📦" />
        <StatCard label="Total units" value={formatNumber(stats.totalUnits)} icon="🔢" />
        <StatCard label="Stock value (cost)" value={formatMoney(stats.totalValue, symbol)} icon="💰" />
        <StatCard label="Potential revenue" value={formatMoney(stats.potentialRevenue, symbol)} icon="📈" />
      </div>
      {stats.lowStock > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ {stats.lowStock} item(s) are at or below their reorder level.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card title={editingId ? "Edit item" : "Add item"} className="lg:col-span-1">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Item name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Widget" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
              <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Tools" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity"><Input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></Field>
              <Field label="Reorder level"><Input type="number" min={0} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit cost"><Input type="number" min={0} step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} /></Field>
              <Field label="Unit price"><Input type="number" min={0} step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Warehouse A" /></Field>
              <Field label="Currency">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {["USD", "EUR", "GBP", "ZAR", "NGN", "KES", "INR", "AED"].map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">{editingId ? "Update" : "Add item"}</Button>
              {editingId ? <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button> : null}
            </div>
            {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}
          </form>
        </Card>

        {/* Table */}
        <Card title="Inventory" className="lg:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search by name, SKU or category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:max-w-xs">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Item</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Cost</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Value</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-6 text-center text-slate-400">No items found.</td></tr>
                ) : filtered.map((i) => {
                  const low = i.quantity <= i.reorderLevel;
                  return (
                    <tr key={i.id} className={low ? "bg-amber-50/50" : ""}>
                      <td className="py-2">
                        <p className="font-medium text-slate-800">{i.name}</p>
                        {i.sku ? <p className="text-xs text-slate-400">{i.sku}</p> : null}
                      </td>
                      <td className="py-2 text-slate-600">{i.category || "—"}</td>
                      <td className="py-2 text-right">{formatNumber(i.quantity)}</td>
                      <td className="py-2 text-right">{formatMoney(i.unitCost, symbol)}</td>
                      <td className="py-2 text-right">{formatMoney(i.unitPrice, symbol)}</td>
                      <td className="py-2 text-right">{formatMoney(i.quantity * i.unitCost, symbol)}</td>
                      <td className="py-2">
                        {low ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">In stock</Badge>}
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => startEdit(i)} className="mr-3 text-indigo-600 hover:underline">Edit</button>
                        <button onClick={() => remove(i.id)} className="text-rose-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </Card>
  );
}
