---
name: check-deploy
description: Controleert de status van de laatste Vercel-deploy via de CLI. Gebruik automatisch na publish-changes en bij "is de deploy klaar", "staat het online", "check de status", "werkt de live site", "is het al bijgewerkt".
---

# Check deploy status

Deze repo deployt via de Vercel CLI (`vercel --prod`). Er is één stap tussen "deploy" en "live": Vercel bouwt en publiceert de deployment.

## Stap 1: Ingelogd?

```
vercel whoami
```

Faalt: voer het Vercel-deel van `setup-machine` uit (stap 8) en probeer opnieuw.

## Stap 2: Laatste deployments ophalen

```
vercel ls --prod
```

Kijk naar de bovenste (meest recente) productie-deployment en de status-kolom.

- `Ready`: door naar stap 4 (succes).
- `Building` / `Queued`: zeg kort "De site wordt nog gebouwd", wacht 15 seconden en probeer zelf opnieuw.
- `Error`: door naar stap 3.

## Stap 3: Bij een fout — logs ophalen

Pak de URL van de gefaalde deployment uit stap 2 en inspecteer:

```
vercel inspect <deployment-url> --logs
```

Vat de fout in gewone taal samen. Bied aan om met `fix-my-mess` terug te gaan naar de vorige werkende versie, of om de fout lokaal te fixen en opnieuw te publiceren.

## Stap 4: Rapporteer

- `Ready`: "De site staat live: [<PRODUCTIE_URL>](<PRODUCTIE_URL>)"
- Nog `Building`/`Queued` na herhaalde check: "De site wordt nog gebouwd", wacht 30 seconden en controleer zelf opnieuw.
- `Error`: geef de samenvatting uit stap 3 en de herstel-opties.

## Geen deployments zichtbaar?

Wacht 30 seconden en probeer nog eenmaal. Blijft het leeg: controleer dat het project gekoppeld is (`vercel link`) en dat er daadwerkelijk een `vercel --prod` is gedaan.
