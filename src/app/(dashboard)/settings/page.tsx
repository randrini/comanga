export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      <div className="grid gap-6">
        {/* Download Clients */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Download Clients
          </h2>
          <div className="space-y-3">
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
                className="flex items-center justify-between rounded-md bg-bg-primary px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      client.enabled ? "bg-success" : "bg-text-muted"
                    }`}
                  />
                  <span className="text-sm text-text-primary">{client.name}</span>
                </div>
                <span className="text-xs text-text-muted">Not configured</span>
              </div>
            ))}
          </div>
        </section>

        {/* Metadata Sources */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Metadata Sources
          </h2>
          <div className="space-y-3">
            {[
              { name: "ComicVine", type: "comicvine", enabled: false },
              { name: "MangaDex", type: "mangadex", enabled: false },
              { name: "AniList", type: "anilist", enabled: false },
              { name: "MangaBaka", type: "mangabaka", enabled: false },
            ].map((source) => (
              <div
                key={source.type}
                className="flex items-center justify-between rounded-md bg-bg-primary px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      source.enabled ? "bg-success" : "bg-text-muted"
                    }`}
                  />
                  <span className="text-sm text-text-primary">{source.name}</span>
                </div>
                <span className="text-xs text-text-muted">No API key</span>
              </div>
            ))}
          </div>
        </section>

        {/* General */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            General
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Download Directory
              </span>
              <span className="text-sm text-text-muted">/media/comics</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Auto-queue monitored
              </span>
              <span className="text-sm text-text-muted">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Max concurrent downloads</span>
              <span className="text-sm text-text-muted">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Retry limit</span>
              <span className="text-sm text-text-muted">3</span>
            </div>
          </div>
        </section>

        {/* System */}
        <section className="rounded-lg border border-border bg-bg-secondary p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">System</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Version</span>
              <span className="text-sm text-text-muted">0.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Database</span>
              <span className="text-sm text-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Redis</span>
              <span className="text-sm text-text-muted">Not configured</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}