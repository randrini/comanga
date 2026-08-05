export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-bg-base" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative w-full max-w-sm space-y-8 rounded-2xl border border-border/50 bg-bg-surface/80 backdrop-blur-sm p-8 shadow-elevated">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/15 border border-accent/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <h1 className="text-2xl font-display tracking-[0.15em] text-text-primary">
              COMANGA
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            Manga, comics &amp; light novel manager
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
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
              className="block w-full rounded-xl border border-border/50 bg-bg-primary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-1.5">
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
              className="block w-full rounded-xl border border-border/50 bg-bg-primary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-text-inverse transition-all duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-bg-surface active:scale-[0.98] shadow-glow"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
