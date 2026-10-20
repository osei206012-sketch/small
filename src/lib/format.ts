export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "ZAR", symbol: "R", label: "South African Rand (R)" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (₦)" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling (KSh)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "AED", symbol: "AED ", label: "UAE Dirham (AED)" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(value: number, symbol = "$"): string {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = Math.abs(safe).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${safe < 0 ? "-" : ""}${symbol}${formatted}`;
}

export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateNumber(prefix: string): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${y}${m}${d}-${rand}`;
}
