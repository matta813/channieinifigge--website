# channieinifigge-website

Lo-Fi-Stream-Seite (YouTube-Embed), ausgeliefert von nginx.

## Struktur

| Datei            | Zweck                                                |
| ---------------- | ----------------------------------------------------- |
| `index.html`     | Die Seite                                             |
| `style.css`      | Styles (extern, damit CSP ohne `unsafe-inline` geht)  |
| `main.js`        | Zustimmungsbasierte YouTube-IFrame-API-Einbindung     |
| `default.conf`   | nginx-Config: Security-Header, CSP, Favicon-Alias, Umami-Proxy |
| `favicon.svg`    | Favicon (auch unter `/favicon.ico` ausgeliefert)      |
| `robots.txt` / `sitemap.xml` | Suchmaschinen-Metadaten                |
| `social-preview.png` | Open-Graph- und Twitter-Vorschaubild              |

## Lokal ausführen

```sh
docker compose up --build
# → http://localhost:8088
```

## Analytics

Seitenaufrufe werden mit einer selbst gehosteten Umami-Instanz
(`https://umami.scruzzi.com`) gezählt. Umami setzt keine Cookies. Anders als
der YouTube-Stream lädt das Tracking ohne vorherige Zustimmung.

Der Tracker wird nicht direkt von der Umami-Domain geladen, sondern über die
eigene Domain (First-Party-Proxy), weil Content-Blocker den
Drittanbieter-Request verwerfen:

| Pfad             | Ziel                                    |
| ---------------- | --------------------------------------- |
| `/a/script.js`   | `https://umami.scruzzi.com/script.js`   |
| `/a/api/send`    | `https://umami.scruzzi.com/api/send`    |

- **Einbindung:** `<script defer src="/a/script.js" data-website-id="…">` in
  `index.html`. Umami leitet den Event-Endpunkt aus dem Script-Pfad ab und
  sendet deshalb automatisch an `/a/api/send`.
- **Proxy:** zwei `location =`-Blöcke in `default.conf`. Nur diese beiden
  Pfade werden weitergereicht; das Umami-Dashboard ist über die Seite nicht
  erreichbar. `X-Forwarded-For` wird durchgereicht, damit Umami die
  Besucher-IP statt der Container-IP sieht.
- **CSP:** kein Eintrag für die Umami-Domain nötig, `'self'` deckt Script und
  Events ab.
- **Website-ID:** steht im `data-website-id`-Attribut und stammt aus dem
  Umami-Dashboard (Einstellungen → Websites).
- **Voraussetzung:** Der Container braucht ausgehenden HTTPS-Zugriff auf
  `umami.scruzzi.com`. nginx löst den Hostnamen nur beim Start auf; siehe
  [OPERATIONS.md](OPERATIONS.md).

## Release & Deployment

GitHub Actions prüft JavaScript, HTML-Metadaten, Security-Header und das
fertige nginx-Image. Der Release-Flow läuft bei Pushes auf `main`:

```
Commit (Conventional Commits)
  → Tests + Commitlint + CodeQL
  → isoliertes semantic-release: SemVer-Bump, CHANGELOG, Tag und Release
  → Trivy: Image-Scan auf hohe und kritische Schwachstellen
  → Buildx: AMD64-/ARM64-GHCR-Image mit SBOM und Provenance
  → Dependabot: wöchentliche Updates für Actions, Docker und npm
  → FluxCD rollt die neue Version im Cluster aus
```

- **Versionierung:** `fix:` → Patch, `feat:` → Minor,
  `BREAKING CHANGE:` → Major. Commits wie `chore:`/`docs:`/`ci:` lösen
  kein Release aus. `chore(deps):` erzeugt für ausgerollte
  Abhängigkeitsupdates automatisch einen Patch-Release.
- **Runtime:** Der unprivilegierte Container lauscht auf Port **8080** (nginx).
- **Produktion:** [https://channieinifigge.uk/](https://channieinifigge.uk/)
- **Architekturen:** veröffentlichte Images unterstützen `linux/amd64` und
  `linux/arm64`; beide Varianten werden vor dem Push separat gescannt.
- **Betrieb und Rollback:** siehe [OPERATIONS.md](OPERATIONS.md).
- **Verfügbarkeit:** Der manuelle GitHub-Actions-Workflow kann die
  Produktionsseite prüfen. Automatische GitHub-hosted Checks sind wegen der
  absichtlichen Regionssperre nicht aktiviert.
