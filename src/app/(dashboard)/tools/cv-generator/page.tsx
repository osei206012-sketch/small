import { requireToolAccess } from "@/lib/access";
import { CvGenerator } from "@/components/tools/cv-generator";

export const dynamic = "force-dynamic";

export const metadata = { title: "CV Generator — BizTools" };

export default async function Page() {
  await requireToolAccess("cv-generator");
  return <CvGenerator />;
}
