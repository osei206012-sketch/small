import { requireToolAccess } from "@/lib/access";
import { InvoiceGenerator } from "@/components/tools/invoice-generator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Invoice & Quotation Generator — BizTools" };

export default async function Page() {
  await requireToolAccess("invoice-generator");
  return <InvoiceGenerator />;
}
