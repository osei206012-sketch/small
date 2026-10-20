import { requireToolAccess } from "@/lib/access";
import { ProfitCalculator } from "@/components/tools/profit-calculator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profit Calculator — BizTools" };

export default async function Page() {
  await requireToolAccess("profit-calculator");
  return <ProfitCalculator />;
}
