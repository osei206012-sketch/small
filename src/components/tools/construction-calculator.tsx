"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Field, Input, Select, Button, Badge } from "@/components/ui";
import { CURRENCIES, currencySymbol, formatMoney, formatNumber } from "@/lib/format";

const RATES: Record<string, number> = { basic: 800, standard: 1400, premium: 2400 };
const RATE_LABELS: Record<string, string> = {
  basic: "Basic (budget finishes)",
  standard: "Standard (mid-range finishes)",
  premium: "Premium (high-end finishes)",
};

interface EstimateRow {
  id: string;
  projectName: string;
  totalCost: number;
  createdAt: string;
}

export function ConstructionCalculator() {
  const [projectName, setProjectName] = useState("My building project");
  const [area, setArea] = useState(120);
  const [floors, setFloors] = useState(1);
  const [quality, setQuality] = useState("standard");
  const [laborPct, setLaborPct] = useState(35);
  const [contingencyPct, setContingencyPct] = useState(10);
  const [vatPct, setVatPct] = useState(15);
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState<EstimateRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const symbol = currencySymbol(currency);

  useEffect(() => {
    fetch("/api/estimates")
      .then((r) => r.json())
      .then((d) => setSaved(d.estimates || []))
      .catch(() => {});
  }, []);

  const result = useMemo(() => {
    const totalArea = Math.max(0, area) * Math.max(1, floors);
    const rate = RATES[quality] ?? RATES.standard;
    const constructionCost = totalArea * rate;
    const laborCost = (constructionCost * laborPct) / 100;
    const subtotal = constructionCost + laborCost;
    const contingency = (subtotal * contingencyPct) / 100;
    const vat = ((subtotal + contingency) * vatPct) / 100;
    const total = subtotal + contingency + vat;
    return { totalArea, rate, constructionCost, laborCost, subtotal, contingency, vat, total };
  }, [area, floors, quality, laborPct, contingencyPct, vatPct]);

  async function save() {
    setMsg(null);
    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName,
        totalCost: result.total,
        data: { area, floors, quality, laborPct, contingencyPct, vatPct, currency, ...result },
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setSaved((s) => [d.estimate, ...s]);
      setMsg("Estimate saved to your account.");
    } else {
      setMsg("Could not save estimate.");
    }
  }

  const line = (label: string, value: number, bold = false) => (
    <div className={`flex items-center justify-between py-2 ${bold ? "border-t border-slate-200 font-semibold" : ""}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${bold ? "text-slate-900" : "text-slate-700"}`}>
        {formatMoney(value, symbol)}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🏗️ Construction Cost Calculator</h1>
        <p className="text-sm text-slate-500">
          Estimate the cost of a building project from area, quality, labour and VAT.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Project details" subtitle="Adjust the inputs — the estimate updates instantly.">
          <div className="space-y-4">
            <Field label="Project name">
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Area per floor (m²)">
                <Input type="number" min={0} value={area} onChange={(e) => setArea(Number(e.target.value))} />
              </Field>
              <Field label="Floors">
                <Input type="number" min={1} value={floors} onChange={(e) => setFloors(Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Finish quality">
              <Select value={quality} onChange={(e) => setQuality(e.target.value)}>
                {Object.keys(RATES).map((k) => (
                  <option key={k} value={k}>{RATE_LABELS[k]} — {formatMoney(RATES[k], symbol)}/m²</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Labour %">
                <Input type="number" min={0} value={laborPct} onChange={(e) => setLaborPct(Number(e.target.value))} />
              </Field>
              <Field label="Contingency %">
                <Input type="number" min={0} value={contingencyPct} onChange={(e) => setContingencyPct(Number(e.target.value))} />
              </Field>
              <Field label="VAT %">
                <Input type="number" min={0} value={vatPct} onChange={(e) => setVatPct(Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Button onClick={save} className="w-full">Save estimate</Button>
            {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}
          </div>
        </Card>

        <Card title="Cost breakdown" subtitle={`${formatNumber(result.totalArea)} m² total area`}>
          <div className="divide-y divide-slate-100">
            {line("Construction (materials)", result.constructionCost)}
            {line(`Labour (${laborPct}%)`, result.laborCost)}
            {line("Subtotal", result.subtotal)}
            {line(`Contingency (${contingencyPct}%)`, result.contingency)}
            {line(`VAT (${vatPct}%)`, result.vat)}
            {line("Estimated total cost", result.total, true)}
          </div>
          <div className="mt-4 rounded-xl bg-indigo-50 p-4">
            <p className="text-xs uppercase tracking-wide text-indigo-600">Estimated total</p>
            <p className="text-3xl font-bold text-indigo-700">{formatMoney(result.total, symbol)}</p>
            <p className="mt-1 text-xs text-indigo-600">
              ≈ {formatMoney(result.total / Math.max(1, result.totalArea), symbol)} per m²
            </p>
          </div>
        </Card>
      </div>

      <Card title="Saved estimates" subtitle="Estimates you've saved to your account.">
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500">No saved estimates yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Project</th>
                  <th className="py-2">Total cost</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saved.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 font-medium text-slate-800">{e.projectName}</td>
                    <td className="py-2">{formatMoney(e.totalCost, symbol)}</td>
                    <td className="py-2 text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</td>
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
