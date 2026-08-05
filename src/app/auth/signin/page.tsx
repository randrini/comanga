export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="w-full max-w-sm space-y-8 rounded-lg border border-border bg-bg-secondary p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider text-accent">
            COMANGA
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manga, comics &amp; light novel manager
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-text-secondary"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="mt-1 block w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="admin"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-xs text-text-muted">
          Default: admin / admin
        </div>
      </div>
    </div>
  );
}