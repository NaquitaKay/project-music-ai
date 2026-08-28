import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

const PROTECTED_PATHS = [
  "/notes",
  "/chord-suggester",
  "/melody-to-chords",
  "/admin",
  "/onboarding",
  "/app",
  "/api/explain-chord",
  "/api/generate-progressions",
];

// Paths an authenticated-but-not-yet-onboarded user is still allowed to hit
// without being bounced to /onboarding (the onboarding page itself, and
// anything auth/API-related that shouldn't ever respond with a redirect).
const ONBOARDING_EXEMPT_PATHS = [
  "/onboarding",
  "/auth",
  "/login",
  "/signup",
  "/api",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refreshes the auth token if needed. Required so server components
  // reading cookies (see src/lib/supabase/server.ts) see a valid session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const isExempt = ONBOARDING_EXEMPT_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (!isExempt) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && !profile.onboarding_completed_at) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
