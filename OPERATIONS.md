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
