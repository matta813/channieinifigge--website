# Betrieb

## Veröffentlichung

Conventional Commits auf `main` werden nach erfolgreichen Tests von
semantic-release ausgewertet. Ein neues Release erzeugt ein versioniertes
GitHub Release und ein GHCR-Image mit Versions-, Commit- und `latest`-Tag.
Das Image wird vor dem Push auf bekannte hohe und kritische Schwachstellen
geprüft. SBOM und Build-Provenance werden zusammen mit dem Image publiziert.

## Überprüfung

- Der Container muss auf Port 8080 mit HTTP 200 antworten.
- Der Workflow `Availability` kann `https://channieinifigge.uk/` manuell
  prüfen. GitHub-hosted Runner können durch die absichtliche Regionssperre
  HTTP 403 erhalten; deshalb ist kein automatischer Zeitplan aktiviert.
- Analytics: `GET /a/script.js` muss HTTP 200 mit JavaScript liefern. Ein
  404 bedeutet, dass noch ein altes Image läuft; ein 502/504, dass der
  Container `umami.scruzzi.com` nicht erreicht.

## Analytics (Umami-Proxy)

nginx löst `umami.scruzzi.com` einmalig beim Start auf.

- **IP der Umami-Instanz geändert:** `/a/script.js` liefert 502/504. Pod bzw.
  Container neu starten, damit nginx den Hostnamen neu auflöst.
- **DNS beim Start nicht verfügbar:** nginx startet nicht
  (`host not found in upstream`). DNS im Cluster prüfen und neu starten.
- **Umami nicht erreichbar:** Die Seite selbst bleibt funktionsfähig, es
  werden nur keine Aufrufe gezählt.

## Rollback

1. Im GitHub Release oder in GHCR das zuletzt funktionierende Image bestimmen.
2. Im FluxCD/Kubernetes-Manifest den Image-Tag auf die vorherige Version oder
   vorzugsweise auf deren Digest setzen.
3. Die Änderung committen und die FluxCD-Synchronisierung abwarten.
4. Startseite, Stream-Zustimmung und Sicherheitsheader prüfen.
5. Ursache in einem separaten Fix beheben; `latest` nicht als Rollback-Ziel
   verwenden.

## Notfall

Wenn ein Scan den Release blockiert, wird das unsichere Image nicht
veröffentlicht. Nur nach dokumentierter Risikobewertung darf eine konkrete
Schwachstelle temporär ausgenommen werden.
