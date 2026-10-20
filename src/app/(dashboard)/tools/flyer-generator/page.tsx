import { requireToolAccess } from "@/lib/access";
import { FlyerGenerator } from "@/components/tools/flyer-generator";

export const dynamic = "force-dynamic";

export const metadata = { title: "Business Flyer Generator — BizTools" };

export default async function Page() {
  await requireToolAccess("flyer-generator");
  return <FlyerGenerator />;
}
