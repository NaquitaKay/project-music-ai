import type { createClient } from "~/lib/supabase/server";

export type ProfileFlags = {
  isAdmin: boolean;
  onboardingCompletedAt: string | null;
};

export async function getProfileFlags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<ProfileFlags> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin, onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();

  return {
    isAdmin: data?.is_admin ?? false,
    onboardingCompletedAt: data?.onboarding_completed_at ?? null,
  };
}
