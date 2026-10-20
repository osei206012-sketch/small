import { requireToolAccess } from "@/lib/access";
import { ConstructionCalculator } from "@/components/tools/construction-calculator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Construction Cost Calculator — BizTools" };

export default async function Page() {
  await requireToolAccess("construction-calculator");
  return <ConstructionCalculator />;
}
