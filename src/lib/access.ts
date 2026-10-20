import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccess, requiredPlanFor, PLANS, type PlanId } from "@/lib/plans";

/**
 * Ensures the visitor is logged in. Redirects to /login otherwise.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/dashboard"));
  return user;
}

/**
 * Ensures the visitor is logged in AND has a plan that grants access to the
 * given tool. If not, they are redirected to the upgrade page.
 */
export async function requireToolAccess(toolId: string) {
  const user = await requireUser();
  const plan = (user.plan as PlanId) || "free";
  if (!canAccess(plan, toolId)) {
    const required = requiredPlanFor(toolId);
    redirect(`/upgrade?tool=${toolId}&plan=${required}`);
  }
  return { user, plan };
}

export function planLabel(plan: PlanId): string {
  return PLANS[plan]?.name ?? "Free";
}
