"use client";

import { useMemo, useState } from "react";
import { Card, Field, Input, Select } from "@/components/ui";
import { CURRENCIES, currencySymbol, formatMoney, formatNumber } from "@/lib/format";

export function ProfitCalculator() {
  const [currency, setCurrency] = useState("USD");
  const [price, setPrice] = useState(100);
  const [unitCost, setUnitCost] = useState(60);
  const [units, setUnits] = useState(200);
  const [fixedCosts, setFixedCosts] = useState(2000);

  const symbol = currencySymbol(currency);

  const r = useMemo(() => {
    const revenue = price * units;
    const variableCost = unitCost * units;
    const totalCost = variableCost + fixedCosts;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const markup = variableCost > 0 ? (profit / variableCost) * 100 : 0;
    const contribution = price - unitCost;
    const breakEven = contribution > 0 ? Math.ceil(fixedCosts / contribution) : 0;
    const breakEvenRevenue = breakEven * price;
    return { revenue, variableCost, totalCost, profit, margin, markup, contribution, breakEven, breakEvenRevenue };
  }, [price, unitCost, units, fixedCosts]);

  const profitTone = r.profit >= 0 ? "green" : "rose";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">📈 Profit Calculator</h1>
        <p className="text-sm text-slate-500">
          Work out profit, margin, markup and your break-even point.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Inputs" subtitle="Enter your numbers — results update live.">
          <div className="space-y-4">
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Selling price / unit">
                <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </Field>
              <Field label="Cost / unit">
                <Input type="number" min={0} value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Units sold">
                <Input type="number" min={0} value={units} onChange={(e) => setUnits(Number(e.target.value))} />
              </Field>
              <Field label="Fixed costs (rent, salaries…)">
                <Input type="number" min={0} value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} />
              </Field>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Results">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Revenue" value={formatMoney(r.revenue, symbol)} />
              <Stat label="Total costs" value={formatMoney(r.totalCost, symbol)} />
              <Stat label="Net profit" value={formatMoney(r.profit, symbol)} tone={profitTone} big />
              <Stat label="Profit margin" value={`${r.margin.toFixed(1)}%`} tone={profitTone} big />
              <Stat label="Markup" value={`${r.markup.toFixed(1)}%`} />
              <Stat label="Contribution / unit" value={formatMoney(r.contribution, symbol)} />
            </div>
          </Card>
          <Card title="Break-even">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Break-even units" value={formatNumber(r.breakEven)} />
              <Stat label="Break-even revenue" value={formatMoney(r.breakEvenRevenue, symbol)} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              You need to sell <strong>{formatNumber(r.breakEven)}</strong> units to cover your fixed costs.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "slate",
  big = false,
}: {
  label: string;
  value: string;
  tone?: "slate" | "green" | "rose";
  big?: boolean;
}) {
  const tones = {
    slate: "text-slate-900",
    green: "text-emerald-600",
    rose: "text-rose-600",
  }[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`${big ? "text-2xl" : "text-lg"} font-bold ${tones}`}>{value}</p>
    </div>
  );
}
