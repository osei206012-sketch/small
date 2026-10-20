export type PlanId = "free" | "pro" | "business";
export type Interval = "monthly" | "yearly";

export interface Plan {
  id: PlanId;
  name: string;
  rank: number;
  monthly: number;
  yearly: number;
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    rank: 0,
    monthly: 0,
    yearly: 0,
    tagline: "Try the essential calculators",
    features: [
      "Construction cost calculator",
      "Profit calculator",
      "1 saved project",
      "Community support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    rank: 1,
    monthly: 19,
    yearly: 190,
    tagline: "Documents & client tools",
    features: [
      "Everything in Free",
      "Invoice & quotation generator",
      "Business flyer generator",
      "CV generator",
      "Unlimited saved documents",
      "Print / PDF export",
      "Email support",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    rank: 2,
    monthly: 49,
    yearly: 490,
    tagline: "Full operations suite",
    features: [
      "Everything in Pro",
      "Stock management tool",
      "Inventory valuation & alerts",
      "Priority support",
      "Team seats (coming soon)",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

// Which plan is required to use each tool.
export const TOOL_ACCESS: Record<string, PlanId> = {
  "construction-calculator": "free",
  "profit-calculator": "free",
  "invoice-generator": "pro",
  "flyer-generator": "pro",
  "cv-generator": "pro",
  "stock-management": "business",
};

export function planPrice(plan: PlanId, interval: Interval): number {
  return interval === "yearly" ? PLANS[plan].yearly : PLANS[plan].monthly;
}

export function canAccess(userPlan: PlanId, toolId: string): boolean {
  const required = TOOL_ACCESS[toolId] ?? "business";
  return PLANS[userPlan].rank >= PLANS[required].rank;
}

export function requiredPlanFor(toolId: string): PlanId {
  return TOOL_ACCESS[toolId] ?? "business";
}

export const TOOLS = [
  {
    id: "construction-calculator",
    name: "Construction Cost Calculator",
    description:
      "Estimate building costs from area, quality level, labour and VAT in seconds.",
    icon: "🏗️",
    href: "/tools/construction-calculator",
    required: "free" as PlanId,
  },
  {
    id: "profit-calculator",
    name: "Profit Calculator",
    description:
      "Work out margins, markup and break-even points for any product or service.",
    icon: "📈",
    href: "/tools/profit-calculator",
    required: "free" as PlanId,
  },
  {
    id: "invoice-generator",
    name: "Invoice & Quotation Generator",
    description:
      "Create branded invoices and quotes, then print or save them as PDF.",
    icon: "🧾",
    href: "/tools/invoice-generator",
    required: "pro" as PlanId,
  },
  {
    id: "flyer-generator",
    name: "Business Flyer Generator",
    description:
      "Design an eye-catching flyer and download it as a PNG or PDF.",
    icon: "🎨",
    href: "/tools/flyer-generator",
    required: "pro" as PlanId,
  },
  {
    id: "cv-generator",
    name: "CV Generator",
    description:
      "Build a clean, professional CV and export it as a printable PDF.",
    icon: "📄",
    href: "/tools/cv-generator",
    required: "pro" as PlanId,
  },
  {
    id: "stock-management",
    name: "Stock Management",
    description:
      "Track inventory, valuation and low-stock alerts in one dashboard.",
    icon: "📦",
    href: "/tools/stock-management",
    required: "business" as PlanId,
  },
] as const;
