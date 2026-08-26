import Link from "next/link";
import { signIn, signInWithGoogle } from "~/app/auth/actions";
import { GoogleIcon } from "~/components/auth/google-icon";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-display text-2xl font-medium tracking-tight">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back. Enter your details to continue.
      </p>

      <form action={signIn} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {params.error && (
          <p className="text-sm text-destructive">{params.error}</p>
        )}
        {params.message && (
          <p className="text-sm text-muted-foreground">{params.message}</p>
        )}

        <Button type="submit" className="mt-2">
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogle} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-foreground underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
