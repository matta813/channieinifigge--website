# channieinifigge-website

Lo-Fi-Stream-Seite (YouTube-Embed), ausgeliefert von nginx.

## Struktur

| Datei            | Zweck                                                |
| ---------------- | ----------------------------------------------------- |
| `index.html`     | Die Seite                                             |
| `style.css`      | Styles (extern, damit CSP ohne `unsafe-inline` geht)  |
| `main.js`        | YouTube-IFrame-API-Einbindung (extern, s.o.)          |
| `default.conf`   | nginx-Config: Security-Header, CSP, Favicon-Alias     |
| `favicon.svg`    | Favicon (auch unter `/favicon.ico` ausgeliefert)      |
| `robots.txt`     | Crawler-Freigabe                                      |

## Lokal ausführen

```sh
docker compose up --build
# → http://localhost:8088
```

## Release & Deployment

Der komplette Flow läuft automatisch bei jedem Push auf `main`
(Details und benötigte CI-Variablen: Kommentar-Block in `.gitlab-ci.yml`):

```
Commit (Conventional Commits)
  → semantic-release: SemVer-Bump, CHANGELOG.md, Git-Tag vX.Y.Z, GitLab-Release
  → Kaniko: Image-Build & Push  (:X.Y.Z, :sha-<commit>, :latest)
  → Renovate (stündlich): erkennt den neuen Tag, MR im GitOps-Repo,
    Patch-Updates automerged
  → FluxCD rollt die neue Version im Cluster aus
```

- **Versionierung:** `fix:` → Patch, `feat:` → Minor,
  `BREAKING CHANGE:` → Major. Commits wie `chore:`/`docs:`/`ci:` lösen
  kein Release (und damit keinen Build) aus.
- **Runtime:** Container lauscht auf Port **80** (nginx).
