---
name: start-site
description: Start de lokale dev-server met live preview. Gebruik bij "start", "begin", "start de site", "open de website", "lokaal draaien", of wanneer een wijziging gevraagd wordt en er nog geen preview draait. Controleert alleen wat nodig is om lokaal te draaien, start `pnpm dev` in de achtergrond en geeft de preview-URL.
---

# Start de site lokaal

## Stap 1: Setup-check

Voer parallel uit (vier losse Bash-calls in één message):

- `node --version`
- `pnpm --version`
- `git --version`
- `agent-browser --version`

GitHub en Vercel zijn niet nodig om lokaal te draaien — die komen pas bij `publiceer` of `setup`.

Faalt een van de vier: meld kort "Ik moet je computer eerst klaarmaken" en delegeer naar `setup-machine` (alleen het lokale deel). Kom daarna terug naar stap 2.

## Stap 2: Dependencies

```
ls node_modules >/dev/null 2>&1
```

Niet aanwezig, of `package.json` is recenter dan `node_modules`:

```
pnpm install
```

## Stap 3: Bestaande preview of vrije poort bepalen

```
lsof -iTCP:3000 -sTCP:LISTEN -Pn
```

Is poort 3000 bezet, check of het luisterende proces uit deze repo-root draait:

```
lsof -a -p <PID> -d cwd -Fn
```

Alleen als de procesmap deze repo-root is én `http://localhost:3000` reageert, hergebruik je die URL. Stop nooit een bestaande server.

Draait poort 3000 voor een ander project, kies een vrije poort (`3001`, dan `3002`) en start met `PORT=3001 pnpm dev`. Bewaar de daadwerkelijk gebruikte preview-URL.

Is poort 3000 vrij: ga door op poort 3000.

## Stap 4: Dev-server starten — in de achtergrond

Roep de Bash-tool aan met `run_in_background: true`:

```
pnpm dev
```

Wacht NIET tot het commando klaar is — een dev-server stopt nooit vanzelf. Gebruik `BashOutput` om te wachten tot je "Ready" of "Local:" ziet (max 30 seconden, in stappen van 3 seconden).

Geen "Ready" binnen 30 seconden: lees de volledige output, vat de error samen in gewone taal en bied een fix aan.

## Stap 5: Bericht

Vroeg de gebruiker alleen "start", stuur:

---

Je site draait lokaal. **Open [<PREVIEW_URL>](<PREVIEW_URL>).**

Wat wil je veranderen? Bijvoorbeeld:
- "Verander de titel naar ..."
- "Maak de knop groen"
- "Voeg een sectie toe over ..."

Wijzigingen verschijnen direct in je browser. Klaar om live te gaan? Zeg "publiceer".

---

Startte deze skill automatisch omdat er al een wijziging gevraagd is: zeg kort "Preview draait, ik voer je wijziging nu uit" en ga direct door met de wijziging.

## Notities

- De dev-server blijft de hele sessie draaien — niet stoppen tenzij gevraagd.
- Na iedere zichtbare wijziging controleer je de pagina met `agent-browser` op desktop en mobiel volgens de hoofd-instructies (`CLAUDE.md`), en stuur je de preview-URL opnieuw mee.
- Bij nieuwe build-errors: vat samen in gewone taal en bied een fix aan.
