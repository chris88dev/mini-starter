---
name: publish-changes
description: Zet de gecontroleerde wijziging live — commit op main + productie-deploy via de Vercel CLI. Gebruik bij "publiceer", "zet het online", "publish", "deploy", "live zetten", "klaar, ga maar". Selecteert alleen bedoelde bestanden, controleert preview en build, vraagt één keer bevestiging en wacht tot de productie-URL live is.
---

# Publiceer wijzigingen

Deploy-model: commit op **`main`** → **`vercel --prod`**. GitHub (indien gekoppeld) is backup, geen deploy-trigger.

## Stap 1: Voorwaarden en staat

```
git branch --show-current
git status --short
git diff --stat
git ls-files --others --exclude-standard
vercel whoami
```

- Geen wijzigingen: zeg "Er is niets om te publiceren" en stop.
- `vercel whoami` faalt (niet ingelogd) of `vercel` ontbreekt: voer het Vercel-deel van `setup-machine` uit (stap 8–9) en ga daarna verder.
- Onverwachte git-staat (conflict, detached HEAD): stop en delegeer naar `fix-my-mess`.

## Stap 2: Bepaal uitsluitend wat live mag

Lees de lokale wijziging en bepaal welke bestanden bij de zichtbare, eerder gepreviewde aanpassing horen. Instructies, tooling, screenshots of conceptwerk gaan niet automatisch mee, tenzij dat expliciet de opdracht is.

Noteer de paden als `PUBLICATIE_BESTANDEN`. Stage hier nog niets.

## Stap 3: Backup vóór committen

```
git branch backup-$(date +%Y%m%d-%H%M%S)
```

Is er een `origin`-remote, haal eerst de laatste `main` op zodat je niet op verouderde code deployt:

```
git remote get-url origin 2>/dev/null && git fetch origin main && git pull --no-rebase origin main
```

Bij een merge-conflict: stop, leg uit dat beide versies veilig zijn en delegeer naar `fix-my-mess`. Publiceer niets.

## Stap 4: Stage alleen de bedoelde bestanden

```
git add -- <PUBLICATIE_BESTANDEN>
git diff --cached --name-only
git diff --cached --stat
git status --short
```

Controleer dat uitsluitend de bedoelde wijziging gestaged staat. Laat de rest bewust ongestaged en meld dat die niet live gaan.

## Stap 5: Laatste kwaliteitscontrole (visueel + build + snelheid)

1. Zorg dat `start-site` draait en controleer de gewijzigde pagina opnieuw met `agent-browser` op desktop (`1280x900`) en mobiel (`390x844`) volgens de hoofd-instructies.
2. Draai de productie-bouw:
   ```
   pnpm build
   ```
3. **Lokale snelheidscheck met Lighthouse — vóór de deploy.** Meet een echte productie-build (niet de dev-server, die geeft misleidend lage cijfers). Start de productie-server in de achtergrond op een aparte poort, zodat de dev-server op 3000 kan blijven draaien:
   ```
   PORT=4000 pnpm start
   ```
   Wacht tot de server "Ready" is en draai Lighthouse (mobiel als primaire meting). Gebruik de globaal geïnstalleerde `lighthouse` (via `setup-machine`); ontbreekt die, val terug op `npx --yes lighthouse`:
   ```
   lighthouse http://localhost:4000 --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-mobile.json
   node scripts/parse-lighthouse.mjs /tmp/lh-mobile.json --label mobiel
   ```
   Stop daarna de productie-server op poort 4000 (laat de dev-server op 3000 staan).

Klopt de preview niet, zijn er browser-errors of faalt de build: **publiceer niets**. Vat het probleem kort samen en herstel eerst.

Lukt Lighthouse niet (bijv. `npx` faalt of er is geen Chrome gevonden): sla de meting over met een korte melding — dit blokkeert de publicatie niet. Vindt Lighthouse geen browser, zet dan `CHROME_PATH` naar de Chrome die `agent-browser` installeerde (zie `agent-browser doctor`), of installeer Google Chrome.

Onthoud de performance-score voor de bevestiging in stap 6.

## Stap 6: Toon wat live gaat en vraag één keer bevestiging

Vat de gestagede inhoud samen in 2–5 bullets en toon de commit-message:

> Ik heb dit gecontroleerd op desktop en mobiel en de build slaagt. Ik ga nu live zetten:
> - Titel op de homepage aangepast naar "..."
>
> PageSpeed (Lighthouse, mobiel, productie-build): score <n>/100 — <goed/matig/slecht>.
>
> Commit-message: "Homepage titel aangepast naar X"
>
> Klopt dit? (ja / nee)

Is de score **slecht** of duidelijk slechter dan verwacht, benoem dat expliciet en vraag of de gebruiker tóch wil publiceren of eerst de oorzaak wil aanpakken (afbeeldingen/fonts/bundle — zie `speedtest`). Kon Lighthouse niet meten, laat de score-regel weg en vermeld dat kort.

Wacht op bevestiging. Bij nee: publiceer niets.

## Stap 7: Commit, backup-tag en deploy

```
git tag backup-$(date +%Y%m%d-%H%M%S)
git commit -m "<heldere Nederlandse beschrijving>"
```

Push naar de backup-remote als die bestaat (mag falen zonder de deploy te blokkeren):

```
git remote get-url origin 2>/dev/null && git push origin main
```

Deploy naar productie:

```
vercel --prod
```

- Gebruik een beschrijvende commit-message, geen "update"/"wip".
- Wacht tot de CLI de definitieve **Production**-URL teruggeeft.

## Stap 8: Verifieer live

Delegeer naar `check-deploy` om te bevestigen dat de deploy de status `Ready` heeft. Eindig pas bij succes of met een concrete fout in gewone taal.

Bij succes:

> Klaar, je wijziging staat live: [<PRODUCTIE_URL>](<PRODUCTIE_URL>)

Wil de gebruiker de snelheid ook op de échte productie-URL bevestigen (PageSpeed Insights), gebruik dan `speedtest`. Dat is optioneel; de bepalende snelheidscheck deed je al lokaal in stap 5.

## Veiligheid

- Nooit `git add -A` bij publiceren; alleen `PUBLICATIE_BESTANDEN`.
- Nooit `git push --force` of `git reset --hard`.
- Bij conflict, onverwachte git-staat of gefaalde controle: stop en publiceer niets.
