# Bewerbungs-Hub – Mona Zaqqa

Persönliches Tool für Bewerbungs-Tracking und Anschreiben-Baukasten.

## Was das Tool kann

**Übersicht (Tracker)**
- Alle Bewerbungen mit Status verwalten (Offen / Eingeladen / Absage / Angebot)
- Statistiken auf einen Blick
- Suchen, filtern, sortieren
- Link zur Stellenanzeige, Ansprechpartner, Notizen

**Anschreiben-Baukasten**
- Formulierungen per Klick kombinieren
- Firma eingeben → [FIRMA] wird automatisch ersetzt
- Live-Vorschau mit Wortzähler
- Qualitäts-Check auf verbotene Formulierungen
- Direkt als Bewerbung speichern

**Formulierungen verwalten**
- Alle Bausteine einsehen und bearbeiten
- Neue Formulierungen einkippen (Rohtexte werden direkt bearbeitbar)
- Eigene Formulierungen löschen, Standard-Formulierungen bearbeiten

## Setup auf GitHub Pages

### Schritt 1: Repository anlegen
1. github.com aufrufen, einloggen
2. "New repository" klicken
3. Name: `bewerbung-hub` (oder beliebig)
4. "Public" lassen (für GitHub Pages kostenlos)
5. "Create repository" klicken

### Schritt 2: Dateien hochladen
1. Im neuen Repository: "Add file" → "Upload files"
2. Diese 4 Dateien hochladen:
   - `index.html`
   - `style.css`
   - `app.js`
   - `data.js`
3. "Commit changes" klicken

### Schritt 3: GitHub Pages aktivieren
1. Repository → "Settings"
2. Links: "Pages" klicken
3. Source: "Deploy from a branch"
4. Branch: "main", Folder: "/ (root)"
5. "Save" klicken

Nach 1–2 Minuten ist die Website unter:
`https://DEIN-USERNAME.github.io/bewerbung-hub/`

## Neue Formulierungen hinzufügen

Einfach auf der Website unter "Formulierungen" → "+ Neue Formulierung":
- Rohen Text einkippen (z.B. von Reddit oder eigene Ideen)
- Text anpassen
- Kategorie und Bezeichnung wählen
- Speichern → sofort im Baukasten verfügbar

Alle Daten werden im Browser gespeichert (localStorage).

## Daten sichern

Da alles im Browser gespeichert wird: beim Wechsel des Browsers oder Geräts gehen die Daten verloren. Regelmäßig unter "Übersicht" die Bewerbungen notieren oder einen Export-Button hinzufügen lassen.
