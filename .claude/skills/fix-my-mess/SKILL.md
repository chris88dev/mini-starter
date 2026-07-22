---
name: fix-my-mess
description: Brengt de repo terug naar een werkende staat — niet-werkende wijzigingen, conflicten, gefaalde deploy, kapotte live site of onbekende git-staat. Gebruik bij "het werkt niet", "er ging iets mis", "draai terug", "undo", "begin opnieuw", "rollback", "terug naar de vorige versie", of wanneer een andere skill een onverwachte git-staat detecteert. Bewaart ALTIJD eerst commits en niet-gecommitte wijzigingen.
---

# Fix my mess

Deze repo werkt op `main` en deployt via de Vercel CLI. Er is geen branch-bescherming — juist daarom eerst altijd verliesvrij bewaren.

## Eerste regel: ALTIJD eerst verliesvrij bewaren

Uitzondering: meldt `git status` een lopend merge-/rebase-conflict, voer eerst `git merge --abort` of `git rebase --abort` uit. Faalt afbreken, stop en vernietig niets.

```
git branch backup-$(date +%Y%m%d-%H%M%S)
git status --short
git stash push -u -m "fix-my-mess backup $(date +%Y%m%d-%H%M%S)"
git stash list
```

Voer `git stash push` alleen uit als `git status --short` inhoud toont. Zeg: "Ik heb eerst een veilig terughaalpunt gemaakt." Bewaar de namen van de backup-branch en stash.

## Stap 2: Diagnose (parallel)

```
git status
git branch --show-current
git log --oneline -10
git stash list
```

## Scenario A — Niet-gecommitte wijzigingen weggooien

Al veilig gestasht in de eerste stap. Zeg: "Ik heb je concept opzij gezet. Zeg `haal mijn laatste concept terug` als je het wilt terugzien." Laat de werkmap schoon.

## Scenario B — Laatste commit terugdraaien (nog niet gedeployed)

Nog geen `vercel --prod` op deze commit? Draai hem netjes terug:

```
git revert HEAD --no-edit
```

Gebruik **nooit** `git reset --hard` om werk op te ruimen.

## Scenario C — Merge-/rebase-conflict

```
git merge --abort || git rebase --abort
```

Vraag daarna of het bewaarde concept teruggezet moet worden (`git stash pop`). Bij een conflict bij pop: stop en leg uit dat beide versies veilig zijn.

## Scenario D — Detached HEAD

```
git switch main
```

## Scenario E — Live site is kapot, snel terug naar de vorige werkende deploy

De snelste weg is de vorige productie-deploy terugzetten via Vercel:

```
vercel rollback
```

(Of expliciet: `vercel ls --prod` om de vorige `Ready`-deployment te vinden, dan `vercel rollback <deployment-url>`.)

Herstel daarnaast de code lokaal zodat main weer klopt:

```
git revert HEAD --no-edit
```

Vraag vóór de rollback bevestiging en leg in gewone taal uit welke live-versie je terugzet. Verifieer daarna met `check-deploy`.

## Scenario F — "Ik weet het echt niet meer"

1. Backups staan (branch + eventuele stash).
2. Leg uit: "Ik zet je werkmap terug naar de laatste werkende versie. Je huidige werk blijft bewaard in de terughaalpunten." Vraag bevestiging.
3. Is er een `origin`-remote:
   ```
   git fetch origin
   git switch -C main origin/main
   ```
   Geen remote: zet terug naar de laatste eigen commit die bouwde (`git log --oneline`), en vraag welke.

## Afsluiting

```
git status
git branch --show-current
```

Bevestig: "Je staat weer op een werkende versie. Je eerdere werk is bewaard; zeg `haal mijn laatste concept terug` als je dat wilt zien." Is de lokale site veranderd door het herstel, zorg dat `start-site` draait en geef opnieuw de preview-link.

## Wat NOOIT mag (staat ook in de deny-lijst van settings.json)

- `git push --force` of `--force-with-lease`
- `git reset --hard` om werk op te ruimen
- `rm -rf .git`
