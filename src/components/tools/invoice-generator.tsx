"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Field, Input, Textarea, Select, Button, Badge } from "@/components/ui";
import { currencySymbol, formatMoney, todayISO, generateNumber } from "@/lib/format";

interface Item {
  description: string;
  qty: number;
  price: number;
}

interface InvoiceRow {
  id: string;
  type: string;
  number: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: string;
}

function emptyItem(): Item {
  return { description: "", qty: 1, price: 0 };
}

export function InvoiceGenerator() {
  const [type, setType] = useState<"invoice" | "quote">("invoice");
  const [number, setNumber] = useState(generateNumber("INV"));
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [taxRate, setTaxRate] = useState(15);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState<InvoiceRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const symbol = currencySymbol(currency);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => setSaved(d.invoices || []))
      .catch(() => {});
  }

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
    const tax = (sub * taxRate) / 100;
    return { subtotal: sub, taxAmount: tax, total: sub + tax };
  }, [items, taxRate]);

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((arr) => [...arr, emptyItem()]);
  }
  function removeItem(idx: number) {
    setItems((arr) => (arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr));
  }

  async function save() {
    setMsg(null);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type, number, clientName: clientName || "Client", clientEmail, clientAddress,
        issueDate, dueDate, items, taxRate, notes, status,
      }),
    });
    if (res.ok) {
      setMsg("Saved to your account.");
      refresh();
    } else {
      setMsg("Could not save. Please check the client name and items.");
    }
  }

  function reset() {
    setType("invoice");
    setNumber(generateNumber("INV"));
    setClientName("");
    setClientEmail("");
    setClientAddress("");
    setIssueDate(todayISO());
    setDueDate("");
    setItems([emptyItem()]);
    setTaxRate(15);
    setNotes("");
    setStatus("draft");
    setMsg(null);
  }

  async function deleteInvoice(id: string) {
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    refresh();
  }

  async function setInvoiceStatus(id: string, newStatus: string) {
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🧾 Invoice & Quotation Generator</h1>
          <p className="text-sm text-slate-500">
            Build an invoice or quote, then print or save it as a PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>🖨️ Print / PDF</Button>
          <Button variant="ghost" onClick={reset}>New</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card title="Document details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <Select value={type} onChange={(e) => { setType(e.target.value as "invoice" | "quote"); setNumber(generateNumber(e.target.value === "quote" ? "QUO" : "INV")); }}>
                  <option value="invoice">Invoice</option>
                  <option value="quote">Quotation</option>
                </Select>
              </Field>
              <Field label="Number">
                <Input value={number} onChange={(e) => setNumber(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issue date">
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </Field>
              <Field label="Due date">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Client name">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Ltd" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Client email">
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="billing@acme.com" />
              </Field>
              <Field label="Currency">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {["USD", "EUR", "GBP", "ZAR", "NGN", "KES", "INR", "AED"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Client address">
              <Textarea rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Line items</span>
                <Button size="sm" variant="outline" onClick={addItem}>+ Add item</Button>
              </div>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_70px_110px_32px] gap-2">
                    <Input
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                    />
                    <Input
                      type="number" min={0} placeholder="Qty"
                      value={it.qty}
                      onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                    />
                    <Input
                      type="number" min={0} placeholder="Price"
                      value={it.price}
                      onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                    />
                    <button
                      onClick={() => removeItem(idx)}
                      className="rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50"
                      title="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax / VAT %">
                <Input type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </Field>
              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </Select>
              </Field>
            </div>
            <Field label="Notes">
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank you note…" />
            </Field>
          </div>
        </Card>

        {/* Preview */}
        <div className="print-area">
          <Card title="Preview">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">BizTools</p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {type === "quote" ? "Quotation" : "Invoice"}
                  </h2>
                  <p className="text-sm text-slate-500">{number}</p>
                </div>
                <Badge tone={status === "paid" ? "green" : status === "sent" ? "indigo" : "slate"}>
                  {status}
                </Badge>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-400">Billed to</p>
                  <p className="font-semibold text-slate-800">{clientName || "—"}</p>
                  {clientAddress ? <p className="text-slate-500">{clientAddress}</p> : null}
                  {clientEmail ? <p className="text-slate-500">{clientEmail}</p> : null}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-slate-400">Dates</p>
                  <p className="text-slate-600">Issued: {issueDate || "—"}</p>
                  {dueDate ? <p className="text-slate-600">Due: {dueDate}</p> : null}
                </div>
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2">{it.description || "—"}</td>
                      <td className="py-2 text-right">{it.qty}</td>
                      <td className="py-2 text-right">{formatMoney(it.price, symbol)}</td>
                      <td className="py-2 text-right">{formatMoney(it.qty * it.price, symbol)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatMoney(subtotal, symbol)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tax ({taxRate}%)</span><span>{formatMoney(taxAmount, symbol)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total</span><span>{formatMoney(total, symbol)}</span>
                </div>
              </div>
              {notes ? <p className="mt-6 text-xs text-slate-500">{notes}</p> : null}
            </div>
          </Card>
        </div>
      </div>

      {/* Saved */}
      <Card title="Saved documents" subtitle="Invoices and quotes saved to your account.">
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500">No saved documents yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Number</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Client</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saved.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 font-medium text-slate-800">{inv.number}</td>
                    <td className="py-2 capitalize">{inv.type}</td>
                    <td className="py-2">{inv.clientName}</td>
                    <td className="py-2">{formatMoney(inv.total, symbol)}</td>
                    <td className="py-2">
                      <select
                        value={inv.status}
                        onChange={(e) => setInvoiceStatus(inv.id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteInvoice(inv.id)} className="text-rose-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
