---
name: crop-image
description: Snijd, resize of converteer een echte site-afbeelding (hero, thumbnail, avatar, og-image), of zet in één keer alle afbeeldingen in `public/` om naar webp. Gebruik bij "snijd deze afbeelding bij", "maak een hero-afbeelding 16:9", "crop deze foto naar vierkant", "resize deze afbeelding naar 800 breed", "zet deze foto om naar webp", "optimaliseer alle afbeeldingen", "converteer public naar webp", of "bereid deze afbeelding voor de site voor". Draait `scripts/crop-image.mjs`, schrijft naar `public/` en laat het origineel altijd ongemoeid.
---

# Afbeelding bijsnijden en klaarmaken voor de site

Bereidt echte site-afbeeldingen voor met `scripts/crop-image.mjs`: center-croppen
op een aspect-ratio, resizen naar een vaste maat, en/of omzetten naar webp, jpg of
png. Handig voor een hero, thumbnail, avatar of og-image.

Gebruikt de macOS-ingebouwde `sips` (crop/resize/jpg/png) en `cwebp` (webp).
Geen extra installatie nodig.

## Gebruik

```
node scripts/crop-image.mjs <input> [--aspect W:H] [--width N] [--height N] [--out PATH] [--format webp|jpg|png]
```

- `--aspect W:H` — center-crop naar de grootste gecentreerde rechthoek met die
  ratio (bijv. `16:9`, `1:1`, `4:5`).
- `--width` / `--height` — resizen. Eén maat behoudt de verhouding; beide maten
  forceren precies die afmetingen.
- `--format` — `webp`, `jpg` of `png`. Standaard: de extensie van de invoer.
- `--out` — expliciet uitvoerpad. Standaard schrijft het script naar
  `public/<naam>-<breedte>x<hoogte>.<ext>`.

## Voorbeelden

Hero-afbeelding, 16:9, 1600 breed, als webp:

```
node scripts/crop-image.mjs foto.jpg --aspect 16:9 --width 1600 --format webp
```

Vierkante avatar, 400x400:

```
node scripts/crop-image.mjs portret.jpg --aspect 1:1 --width 400
```

Og-image, exact 1200x630 (social preview):

```
node scripts/crop-image.mjs banner.jpg --width 1200 --height 630 --out public/og-image.jpg
```

## Alles naar webp in één keer (batch)

Om **alle** PNG/JPG-afbeeldingen in een map naar webp te zetten (zonder croppen of
resizen — pure formaatconversie), gebruik `--all`:

```
node scripts/crop-image.mjs --all            # standaard: de map public/
node scripts/crop-image.mjs --all public/img # of een specifieke map
```

- Zoekt recursief naar `.png`, `.jpg` en `.jpeg`; `.webp`/`.avif`/`.svg`/`.gif`
  worden overgeslagen.
- Schrijft `naam.webp` náást het origineel. Een bestaande `.webp` wordt niet
  overschreven (die afbeelding wordt overgeslagen).
- Rapporteert per bestand en in totaal hoeveel kleiner het werd.
- De originelen blijven staan. Wijs daarna je `<img>`/`next/image` naar de
  `.webp`-bestanden en verwijder eventueel de originelen.

Dit is relevant omdat deze repo `images: { unoptimized: true }` gebruikt: Next
serveert afbeeldingen zoals ze in `public/` staan, dus webp aan de bronkant
scheelt direct laadtijd. De `speedtest`-skill biedt deze conversie actief aan
wanneer grote afbeeldingen de LCP omhoog duwen.

## Notities

- Het origineel wordt NOOIT overschreven — er komt altijd een nieuw bestand bij.
- Zonder `--out` belandt het resultaat in `public/` (wordt aangemaakt als het nog
  niet bestaat), zodat je het direct in de site kunt gebruiken.
- Na afloop print het script het pad, de eindafmeting, het formaat en de
  bestandsgrootte.
