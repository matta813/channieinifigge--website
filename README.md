# channieinifigge-website

Lo-Fi-Stream-Seite (YouTube-Embed), ausgeliefert von nginx.

## Struktur

| Datei            | Zweck                                                |
| ---------------- | ----------------------------------------------------- |
| `index.html`     | Die Seite                                             |
| `style.css`      | Styles (extern, damit CSP ohne `unsafe-inline` geht)  |
| `main.js`        | Zustimmungsbasierte YouTube-IFrame-API-Einbindung     |
| `default.conf`   | nginx-Config: Security-Header, CSP, Favicon-Alias     |
| `favicon.svg`    | Favicon (auch unter `/favicon.ico` ausgeliefert)      |
| `robots.txt`     | Crawler-Freigabe                                      |

## Lokal ausführen

```sh
docker compose up --build
# → http://localhost:8088
```

## Release & Deployment

GitHub Actions prüft JavaScript, HTML-Metadaten, Security-Header und das
fertige nginx-Image. Der Release-Flow läuft bei Pushes auf `main`:

```
Commit (Conventional Commits)
  → Tests + Commitlint + CodeQL
  → isoliertes semantic-release: SemVer-Bump, CHANGELOG, Tag und Release
  → Trivy: Image-Scan auf hohe und kritische Schwachstellen
  → Buildx: GHCR-Image mit SBOM und Provenance
  → Dependabot: wöchentliche Updates für Actions, Docker und npm
  → FluxCD rollt die neue Version im Cluster aus
```

- **Versionierung:** `fix:` → Patch, `feat:` → Minor,
  `BREAKING CHANGE:` → Major. Commits wie `chore:`/`docs:`/`ci:` lösen
  kein Release aus. `chore(deps):` erzeugt für ausgerollte
  Abhängigkeitsupdates automatisch einen Patch-Release.
- **Runtime:** Der unprivilegierte Container lauscht auf Port **8080** (nginx).
- **Betrieb und Rollback:** siehe [OPERATIONS.md](OPERATIONS.md).
- **Verfügbarkeit:** Der manuelle GitHub-Actions-Workflow nimmt die
  Produktions-URL als Eingabe; eine feste öffentliche Domain ist im
  Repository derzeit nicht hinterlegt.
