---
name: speedtest
description: Meet de web-performance (Core Web Vitals) van de site en rapporteert in gewone taal. Gebruik bij "hoe snel is mijn site", "speedtest", "meet de snelheid", "core web vitals", "lighthouse", "is mijn site snel genoeg", "performance check".
---

# Speedtest (Core Web Vitals)

Meet hoe snel de site laadt en rapporteer dat in gewone taal. Er zijn twee meetpaden. Kies het juiste pad op basis van wat je wilt meten, meet mobiel én desktop, en vat het resultaat samen.

## Stap 1: Kies het doel en het meetpad

- **Publieke productie-URL** (de live site, bereikbaar op internet) → gebruik **PageSpeed Insights (PSI)**. Dit draait bij Google, dus je hebt geen lokale Chrome of installatie nodig. Dit is het aanbevolen pad.
- **Lokale preview** (`http://localhost:3000`) → gebruik **lokale Lighthouse**. Let op: cijfers van de dev-server (`pnpm dev`) zijn misleidend traag. Meet daarom een productie-build (`pnpm build && pnpm start`), of beter nog: meet de echte productie-URL via PSI.

Weet je de productie-URL niet? Haal die uit `vercel ls --prod` (bovenste = meest recente).

## Stap 2: Maak de JSON in /tmp

### Pad A — PSI (publieke URL)

Vervang `<URL>` door de publieke URL. Draai beide keren, voor mobiel en desktop:

```
curl --fail --silent --show-error "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=mobile&category=performance" -o /tmp/psi-mobile.json
curl --fail --silent --show-error "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=desktop&category=performance" -o /tmp/psi-desktop.json
```

Het antwoord is JSON met een `lighthouseResult`-object erin; het parse-script pakt dat vanzelf uit.

Krijg je HTTP 429 ("Quota exceeded")? Dan is de gratis limiet zonder API-sleutel op. Wacht even en probeer opnieuw, of meld dat kort aan de gebruiker.

### Pad B — Lokale Lighthouse (localhost)

Zorg dat de preview draait (bij voorkeur een productie-build: `pnpm build && pnpm start`). Dan:

```
npx --yes lighthouse <url> --quiet --chrome-flags="--headless=new" --preset=desktop --output=json --output-path=/tmp/lh-desktop.json
npx --yes lighthouse <url> --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-mobile.json
```

`npx` haalt Lighthouse de eerste keer op (dat kan even duren). De mobiele run laat je `--preset` weg (mobiel is de standaard).

## Stap 3: Parse en toon beide runs

```
node scripts/parse-lighthouse.mjs /tmp/psi-mobile.json --label mobiel
node scripts/parse-lighthouse.mjs /tmp/psi-desktop.json --label desktop
```

(Bij pad B wijs je naar `/tmp/lh-mobile.json` en `/tmp/lh-desktop.json`.)

Het script accepteert zowel het ruwe Lighthouse-resultaat als het PSI-antwoord en toont per meetwaarde een oordeel: **goed / matig / slecht**.

## Stap 4: Rapporteer in gewone taal

Vat samen wat er goed en minder goed is. Leg de belangrijkste waarden kort uit:

- **Performance-score** — algemeen rapportcijfer (goed ≥ 90, matig ≥ 50).
- **LCP** — hoe snel het grootste element in beeld staat (goed ≤ 2,5 s, matig ≤ 4 s).
- **CLS** — hoeveel de pagina verspringt tijdens het laden (goed ≤ 0,1, matig ≤ 0,25).
- **TBT** — hoe lang de pagina "vastzit" tijdens laden (goed ≤ 200 ms, matig ≤ 600 ms).
- **INP** — hoe snel de site reageert op klikken (goed ≤ 200 ms), alleen getoond als beschikbaar.

Is de score **slecht**, noem dan op hoofdlijnen concrete vervolgstappen:

- **Afbeeldingen**: gebruik `next/image`, juiste afmetingen, moderne formaten (WebP/AVIF). Grote afbeeldingen zijn de meest voorkomende oorzaak van een hoge LCP.
- **Lettertypes**: laad fonts via `next/font` zodat tekst niet verspringt (helpt CLS en LCP).
- **Bundle/JavaScript**: minder of later ladend JavaScript verlaagt TBT/INP; check zware client-componenten en third-party scripts.

Bied aan om een van deze punten concreet op te pakken.

### Afbeeldingen: bied webp-conversie actief aan

Signaleert het rapport zware afbeeldingen (een hoge LCP, of een expliciete
Lighthouse-hint als "serveer afbeeldingen in moderne formaten"), controleer dan
of er nog niet-geoptimaliseerde afbeeldingen in `public/` staan:

```
find public -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \)
```

Zijn die er, bied dan aan ze in één keer naar webp te zetten via de
`crop-image`-skill (batch-modus). Dit weegt hier extra zwaar omdat de repo
`images: { unoptimized: true }` gebruikt — Next serveert de bestanden ongewijzigd,
dus webp aan de bronkant helpt direct:

```
node scripts/crop-image.mjs --all
```

De originelen blijven staan; wijs daarna de `<img>`/`next/image`-verwijzingen
naar de nieuwe `.webp`-bestanden. Doe dit alleen na akkoord van de gebruiker.

## Let op

Deze skill staat alleen onder `.claude/skills/speedtest/`. De map `.agents/skills` is een symlink naar `.claude/skills`, dus Codex ziet dezelfde skill automatisch — maak geen tweede kopie aan.
