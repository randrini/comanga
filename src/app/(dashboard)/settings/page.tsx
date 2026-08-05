export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-semibold text-text-primary">Settings</h1>

      <div className="grid gap-5">
        {/* Download Clients */}
        <section className="rounded-xl border border-border/50 bg-bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-text-primary">
              Download Clients
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Configure download clients for automated retrieval
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {[
              { name: "SLSKD (Soulseek)", type: "slskd", enabled: true },
              { name: "Prowlarr (Indexers)", type: "prowlarr", enabled: false },
              { name: "qBittorrent", type: "qbittorrent", enabled: false },
              { name: "SABnzbd", type: "sabnzbd", enabled: false },
              { name: "GetComics", type: "getcomics", enabled: false },
              { name: "ComicsCode", type: "comicscode", enabled: false },
            ].map((client) => (
              <div
                key={client.type}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      client.enabled ? "bg-accent" : "bg-bg-hover"
                    }`}
                    role="switch"
                    aria-checked={client.enabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                        client.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-sm text-text-primary font-medium">
                      {client.name}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-text-muted">
                  {client.enabled ? "Configured" : "Not configured"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Metadata Sources */}
        <section className="rounded-xl border border-border/50 bg-bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-text-primary">
              Metadata Sources
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Configure metadata providers for series information
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {[
              { name: "ComicVine", type: "comicvine", enabled: false },
              { name: "MangaDex", type: "mangadex", enabled: false },
              { name: "AniList", type: "anilist", enabled: false },
              { name: "MangaBaka", type: "mangabaka", enabled: false },
            ].map((source) => (
              <div
                key={source.type}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <button
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      source.enabled ? "bg-accent" : "bg-bg-hover"
                    }`}
                    role="switch"
                    aria-checked={source.enabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                        source.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-sm text-text-primary font-medium">
                      {source.name}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-text-muted">
                  {source.enabled ? "API key set" : "No API key"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* General */}
        <section className="rounded-xl border border-border/50 bg-bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-text-primary">General</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Application-wide settings
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {[
              { label: "Download Directory", value: "/media/comics" },
              { label: "Auto-queue monitored", value: "Enabled" },
              { label: "Max concurrent downloads", value: "3" },
              { label: "Retry limit", value: "3" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover/30 transition-colors duration-150"
              >
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm text-text-muted font-mono text-xs">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* System */}
        <section className="rounded-xl border border-border/50 bg-bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="text-sm font-semibold text-text-primary">System</h2>
            <p className="text-xs text-text-muted mt-0.5">
              System information and status
            </p>
          </div>
          <div className="divide-y divide-border/30">
            {[
              { label: "Version", value: "0.1.0" },
              { label: "Database", value: "Connected", status: "success" },
              { label: "Redis", value: "Not configured", status: "muted" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover/30 transition-colors duration-150"
              >
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span
                  className={`text-sm ${
                    item.status === "success"
                      ? "text-success font-medium"
                      : "text-text-muted"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
