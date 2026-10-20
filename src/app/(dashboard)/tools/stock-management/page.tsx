import { requireToolAccess } from "@/lib/access";
import { StockManagement } from "@/components/tools/stock-management";

export const dynamic = "force-dynamic";

export const metadata = { title: "Stock Management — BizTools" };

export default async function Page() {
  await requireToolAccess("stock-management");
  return <StockManagement />;
}
