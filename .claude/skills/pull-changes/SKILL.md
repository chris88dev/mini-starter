---
name: pull-changes
description: Haalt wijzigingen op en mergt ze veilig. Twee bronnen: updates van de starter-template (upstream, met een slimme merge die je personalisaties beschermt) en je eigen laatste versie (origin, bij werken op meerdere machines). Gebruik bij "haal wijzigingen op", "sync", "update naar laatste versie", "haal template-updates", "upstream mergen", "update mijn starter". Maakt ALTIJD eerst een backup.
---

# Pull changes (sync)

Twee scenario's. Is het onduidelijk welke bedoeld wordt, vraag het kort:

- **A. Template-updates (upstream):** nieuwe skills, scripts of fixes uit de mini-starter-template in dit project halen en slim mergen — zonder je eigen personalisaties (projectnaam, homepage, etc.) te overschrijven.
- **B. Eigen laatste versie (origin):** dit project op deze machine bijwerken naar wat er op je eigen GitHub-repo staat (handig bij werken op meerdere machines).

## Altijd eerst: verliesvrij bewaren

```
git branch backup-$(date +%Y%m%d-%H%M%S)
git status --short
git stash push -u -m "pull-changes backup $(date +%Y%m%d-%H%M%S)"
git stash list
```

Voer `git stash push` alleen uit als `git status --short` inhoud toont. Zeg: "Ik heb eerst een veilig terughaalpunt gemaakt." Bewaar de namen van backup-branch en stash. Herstel eventueel gestasht werk aan het eind met `git stash pop` (bij conflict: stoppen, niet destructief oplossen).

## Scenario A — Template-updates (upstream) slim mergen

1. Zorg voor een `upstream`-remote naar de template. Controleer:
   ```
   git remote get-url upstream 2>/dev/null || echo "geen upstream"
   ```
   Ontbreekt hij, voeg de template toe:
   ```
   git remote add upstream https://github.com/chris88dev/mini-starter.git
   ```
2. Haal op en kijk wat er nieuw is:
   ```
   git fetch upstream
   git log --oneline main..upstream/main
   ```
   Niets nieuw? Meld dat en stop.
3. **Slim mergen** — probeer de merge, maar bescherm personalisaties:
   ```
   git merge upstream/main --no-edit
   ```
   - **Schone merge** (alleen skills/scripts/config veranderd): klaar, door naar stap 4.
   - **Conflicten** — meestal in gepersonaliseerde bestanden (`CLAUDE.md`, `AGENTS.md`, `package.json`, `app/`): **STOP**, los niets destructief automatisch op. Toon per bestand het conflict en help kiezen:
     - jouw personalisatie behouden (projectnaam, beschrijving, homepage) — **dit is de default bij twijfel**, of
     - de template-versie overnemen (bijv. bij een verbeterde skill), of
     - handmatig combineren (template-verbetering + jouw naam/tekst).
     Voor **skills en scripts** neem je in de regel de template-versie over (dat zijn de updates die je wilt). Voor **projectidentiteit en site-inhoud** behoud je die van jou.
   - Kun of wil je niet verder: `git merge --abort` en delegeer naar `fix-my-mess`.
4. Na een geslaagde merge:
   ```
   cp CLAUDE.md AGENTS.md
   pnpm run check:skills
   ```
   Veranderde de lockfile: `pnpm install`. Veranderden er `app/`-bestanden: doe een korte visuele controle (`agent-browser`, desktop + mobiel) volgens `CLAUDE.md`.
5. Commit de merge en push naar je eigen repo:
   ```
   git commit --no-edit
   git push origin main
   ```

## Scenario B — Eigen origin bijwerken (multi-machine)

```
git fetch origin main
git pull --no-rebase origin main
```

- Conflict: **STOP**, leg uit dat beide versies veilig bewaard zijn en delegeer naar `fix-my-mess`.
- Veranderden er bestanden die de site raken: herstart/refresh de preview (`start-site`) en geef opnieuw de preview-link.

## Veiligheid

- Nooit `git push --force`, nooit `git reset --hard`. Bij een vastgelopen merge: `git merge --abort`, dan `fix-my-mess`.
- Overschrijf **personalisaties niet** zomaar met template-inhoud: projectidentiteit in `CLAUDE.md`/`AGENTS.md`, `package.json` `"name"`, en je homepage/site-inhoud blijven van jou.
- Houd `CLAUDE.md` en `AGENTS.md` gelijk na elke merge (`cp CLAUDE.md AGENTS.md` + `pnpm run check:skills`).
