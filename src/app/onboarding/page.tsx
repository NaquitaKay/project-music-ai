import { redirect } from "next/navigation";
import { OnboardingFlow } from "~/components/onboarding/onboarding-flow";
import { getProfileFlags } from "~/lib/supabase/profile";
import { createClient } from "~/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { onboardingCompletedAt } = await getProfileFlags(supabase, user.id);
  if (onboardingCompletedAt) redirect("/app");

  return <OnboardingFlow />;
}
