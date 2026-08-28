import { redirect } from "next/navigation";
import { createClient } from "~/lib/supabase/server";

type ProfileRow = {
  id: string;
  email: string | null;
  created_at: string;
};

type ProgressionRow = {
  user_id: string;
  source: "chord-suggester" | "melody-to-chords";
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!ownProfile?.is_admin) redirect("/");

  const [{ data: profiles }, { data: progressions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("created_at", { ascending: false }),
    // Only what's needed for counts - melody/harmonization are unbounded
    // JSONB blobs and would be wasted bandwidth on a count-only page.
    supabase.from("progressions").select("user_id, source"),
  ]);

  const counts = new Map<string, { generated: number; hummed: number }>();
  for (const row of (progressions ?? []) as ProgressionRow[]) {
    const entry = counts.get(row.user_id) ?? { generated: 0, hummed: 0 };
    if (row.source === "chord-suggester") entry.generated += 1;
    else entry.hummed += 1;
    counts.set(row.user_id, entry);
  }

  const rows = ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const c = counts.get(profile.id) ?? { generated: 0, hummed: 0 };
    return {
      id: profile.id,
      email: profile.email ?? "—",
      joined: new Date(profile.created_at).toLocaleDateString(),
      generated: c.generated,
      hummed: c.hummed,
      total: c.generated + c.hummed,
    };
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every signed-up user and how many progressions they've saved.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium text-right">
                Generated (Chord Suggester)
              </th>
              <th className="px-4 py-2 font-medium text-right">
                Hummed (Melody to Chords)
              </th>
              <th className="px-4 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2">{row.email}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.joined}
                </td>
                <td className="px-4 py-2 text-right">{row.generated}</td>
                <td className="px-4 py-2 text-right">{row.hummed}</td>
                <td className="px-4 py-2 text-right font-medium">
                  {row.total}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
