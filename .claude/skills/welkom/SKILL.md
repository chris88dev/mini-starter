---
name: welkom
description: Korte intro én eerste-keer onboarding van deze werkruimte. Gebruik bij de eerste boodschap van een sessie als de gebruiker begroet, hulp vraagt of niet weet waar te beginnen (triggers "hallo", "hi", "help", "wat kan ik hier", "waar begin ik", "hoe werkt dit"), en ALTIJD wanneer deze repo nog niet is gepersonaliseerd (verse kloon). Niet gebruiken als er al een concrete opdracht ligt.
---

# Welkom + onboarding

## Stap 1: Is dit een verse kloon?

Lees `CLAUDE.md`. Staat daarin nog de marker `<!-- onboarding: pending -->` → dit is een nieuwe kloon die nog niet is ingericht: ga naar **Onboarding**. Staat er `<!-- onboarding: done -->` (of geen marker): sla onboarding over en ga naar **Gewone intro**.

## Onboarding (eenmalig, bij een verse kloon)

Stuur dit en wacht op antwoord — trigger nog geen andere skill:

---

Welkom! Ik richt deze werkruimte even voor jouw project in. Twee korte vragen:

1. **Hoe heet je project?** (bijv. "Petito's Proeverij")
2. **Wat voor site is het / waar gaat het over?** (één zin)

En wil je dat ik de homepage-titel meteen op je projectnaam zet? (ja / nee)

---

Nadat de gebruiker antwoordt, personaliseer je de repo. Zeg kort wat je doet en pas dan aan:

1. **CLAUDE.md** — vervang `<!-- onboarding: pending -->` door `<!-- onboarding: done -->`, zet de regel `**Project:**` op `**Project:** <naam> — <beschrijving>`, en herschrijf de openingsalinea zodat die dit concrete project beschrijft. Noem het **niet meer** "boilerplate" of "mini-starter". Laat de rest van de instructies (deploy-model, skills, veiligheid) ongemoeid.
2. **AGENTS.md** — draai `cp CLAUDE.md AGENTS.md` zodat beide gelijk blijven.
3. **package.json** — zet `"name"` op een slug van de projectnaam (kleine letters, cijfers, koppeltekens; geen spaties/leestekens).
4. **app/layout.tsx** — zet `metadata.title` op de projectnaam en `metadata.description` op de beschrijving.
5. **Alleen als de gebruiker "ja" zei op de homepage-vraag:** zet in `app/page.tsx` de `<h1>` op de projectnaam en pas de subtitel eronder aan op de beschrijving. Laat de rest van de pagina staan.
6. Draai `pnpm run check:skills` (moet groen zijn).

Wijzig je een homepage-tekst (stap 5), volg dan de preview-routine uit `CLAUDE.md`: zorg dat de dev-server draait en controleer de pagina met `agent-browser` op desktop en mobiel vóór je meldt dat het klaar is.

Bevestig kort: "Klaar — deze werkruimte is nu ingesteld voor **<naam>**." Ga daarna direct door naar **Gewone intro** (met de echte projectnaam) en wacht op de volgende boodschap.

## Gewone intro

Stuur dit bericht (vul de echte projectnaam in als die bekend is, anders "je website"):

---

Dit is je werkruimte voor **<Project>**: een Next.js + Tailwind-site met ingebouwde skills. Je werkt **direct op `main`** en deployt via de **Vercel CLI**. Zeg gewoon in je eigen woorden wat je wilt:

**Starten:** "start" — dev-server + live preview op localhost
**Wijzigen:** "verander de titel naar X", "maak de knop groen" — ik pas het aan en controleer de pagina op desktop en mobiel
**Afbeelding klaarmaken:** "snijd deze foto bij tot 16:9" — croppen/resizen naar `public/`
**Live zetten:** "publiceer" — commit op `main` + `vercel --prod`, je krijgt de productie-URL terug
**Snelheid checken:** "hoe snel is mijn site?" — Core Web Vitals in gewone taal
**Status:** "is de deploy klaar?" — ik check de laatste Vercel-deploy
**Herstel:** "fix" of "draai terug" — terug naar een werkende versie, met backup
**Eerste keer / nieuwe machine:** "setup" — installeert tools, logt in op GitHub + Vercel, en zet de site voor het eerst online

Eerste keer op deze computer? Zeg "setup" en ik loop met je door alles tot de site live staat. Anders: zeg "start".

---

Wacht daarna op de volgende boodschap. Trigger geen andere skill in dezelfde respons. Ligt er al een concrete opdracht, sla dit over en voer die uit.
