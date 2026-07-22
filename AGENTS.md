# Instructies voor deze website

Dit is een minimale Next.js + Tailwind boilerplate die deployt naar Vercel via de **Vercel CLI**. De gebruiker is licht technisch: termen als branch, commit, deploy en CLI mogen zonder uitleg, maar houd het kort en concreet.

## Deploy-model

- Je werkt **direct op `main`**. Geen beschermde branch, geen merge-Action. Committen en (waar gekoppeld) pushen gaan naar `main`.
- Publiceren = commit op `main` + **`vercel --prod`** via de Vercel CLI. De CLI geeft de productie-URL terug.
- **Git + GitHub zijn het vangnet** (historie, backup, `fix-my-mess`), niet de deploy-trigger. GitHub is optioneel; zonder remote werkt de deploy nog steeds.
- Force-push en harde resets zijn verboden. Gebruik geen `git push --force` of `git reset --hard`; herstel via `fix-my-mess`, dat eerst terughaalpunten maakt. Gebruik geen `git rebase -i` zonder eerst een backup-branch (`git branch backup-YYYYMMDD-HHMM`).
- Een kapotte live site zet je het snelst terug met `vercel rollback` (vorige productie-deploy); herstel daarnaast de code op `main` met `git revert`.

## Communicatie

- Antwoord in het Nederlands tenzij de gebruiker Engels schrijft.
- Houd uitleg kort en concreet. Technisch jargon mag, maar leg niet-triviale keuzes wel uit.
- Toon altijd wat je gaat doen vóór onomkeerbare acties (push, deploy, delete, reset).
- Bij build- of lintfouten: vat ze samen in gewone taal, stel een fix voor.
- Bij twijfel: vraag, in plaats van aannemen.

## Agent teams (parallel werk)

Bij niet-triviaal werk werken we bij voorkeur met een **agent team** van subagents, zodat onafhankelijke taken parallel lopen in plaats van sequentieel.

- **Orchestrator op Fable** (`claude-fable-5`): coördineert, verdeelt het werk en houdt overzicht — schrijft zelf zo min mogelijk code.
- **Agents op Opus 4.8** (`claude-opus-4-8`, het maximale model): het echte denk- en codeerwerk.
- **Subagents kiezen zelf** het model dat bij hun deeltaak past (bijv. Haiku of Sonnet voor eenvoudige lookups of research).
- Zet onafhankelijke taken in één keer als aparte subagents uit; wacht niet nodeloos sequentieel.
- Houd gedeelde staat (dev-server, `node_modules`, git-index) bij één agent om conflicten te voorkomen; gebruik worktree-isolatie wanneer meerdere agents tegelijk bestanden wijzigen.

**Bij start van een sessie:** controleer of de orchestrator op Fable draait. Zo niet, meld dat kort en stel voor over te schakelen naar Fable (bijv. `/model claude-fable-5`) voordat je een groot agent-team uitzet. Draai je al op Fable, ga gewoon door.

## Package manager

- Deze repo gebruikt **pnpm** (versie staat in `package.json` bij `packageManager`).
- Gebruik nooit `npm` of `yarn` voor dependencies van de site — dat verpest de lockfile.
- Machine-tools (`agent-browser`, `vercel`) worden globaal geïnstalleerd (Homebrew of npm-global) via `setup-machine`; die raken de lockfile niet.
- `setup-machine` installeert Node 22 LTS en activeert Corepack, zodat de pnpm-versie uit `package.json` beschikbaar blijft.

## Packages installeren

- Installeer GEEN nieuwe dependencies zonder eerst kort te overleggen waarom dat nodig is.
- Bij een install: leg in een zin uit wat het pakket doet, waarom het nodig is en de globale grootte-impact.
- `pnpm-workspace.yaml` heeft een 5-dagen cooldown (`minimumReleaseAge: 7200`) om verse compromised packages te blokkeren. Bypass deze NOOIT met `--ignore-minimum-release-age`.

## Skills die in deze repo zitten

- `welkom` - korte technische intro bij eerste opening of als de gebruiker niet weet waar te beginnen
- `setup-machine` - verse Mac + accounts klaarzetten (Homebrew, Node 22, Git, Corepack, agent-browser, Vercel CLI), inloggen op GitHub + Vercel, en de eerste productie-deploy tot de site live staat
- `start-site` - start lokale dev-server en levert de preview-URL
- `agent-browser` - controleert lokale wijzigingen visueel op desktop en mobiel
- `publish-changes` - commit op `main` + `vercel --prod`
- `check-deploy` - status van de laatste Vercel-deploy
- `fix-my-mess` - terug naar een werkende staat (met automatische backup)
- `speedtest` - meet de snelheid (Core Web Vitals) van de productie-URL via PageSpeed Insights, of van de lokale preview via Lighthouse; rapporteert in gewone taal
- `crop-image` - snijdt/resize site-afbeeldingen (hero, thumbnail, og-image) naar formaat of aspect ratio met macOS `sips`; output naar `public/`, het origineel blijft ongewijzigd

Trigger deze skills automatisch op natuurlijke taal. Wacht niet tot de gebruiker de skill bij naam noemt.

De skillbron staat in `.claude/skills`; `.agents/skills` is een symlink naar dezelfde map zodat Claude en Codex exact dezelfde workflows gebruiken. Pas skills alleen in `.claude/skills` aan en voer daarna `pnpm run check:skills` uit. Houd `AGENTS.md` en `CLAUDE.md` inhoudelijk gelijk.

## Websitewijzigingen altijd previewen

Bij ieder verzoek dat zichtbare inhoud van de site verandert (tekst, afbeelding, styling, layout, pagina of component):

1. Zorg **vóór het bewerken** dat de lokale dev-server draait. Heb je nog geen werkende preview-URL voor deze sessie, trigger eerst `start-site` en ga daarna pas wijzigen.
2. Bewaar de gebruikte preview-URL; normaal `http://localhost:3000`, bij een bezette poort bijv. `http://localhost:3001`.
3. Wacht na de wijziging tot de dev-server zonder build-error reageert.
4. Controleer daarna met `agent-browser` de gewijzigde pagina op desktop (`1280x900`) en mobiel (`390x844`). Let op afgebroken of overlappende tekst, horizontale overflow, ontbrekende onderdelen en browser-errors. Los zichtbare problemen op en controleer opnieuw.
5. Geef na elke wijziging altijd een klikbare preview-link: `Bekijk je wijziging: [http://localhost:3000](http://localhost:3000)` (met de werkelijk gebruikte poort).

Voer bij de eerste `agent-browser`-controle van een sessie `agent-browser skills get core` uit voor de actuele CLI-instructies. Deze routine geldt ook voor kleine tekstwijzigingen.

## Publiceren

Wanneer de gebruiker zegt dat een wijziging live mag:

1. Trigger `publish-changes` en voltooi de volledige flow, inclusief deploycontrole; vraag niet apart of de status gecheckt moet worden.
2. Publiceer alleen bestanden die bij de bekeken en goedgekeurde wijziging horen. Stage nooit automatisch alle lokale bestanden (behalve de allereerste commit van een nieuwe repo in `setup-machine`).
3. Voer vlak voor committen opnieuw de visuele desktop- en mobiele controle uit en draai `pnpm build`. Bij fouten gaat niets live.

## Herstel zonder verlies

Bij herstellen, terugdraaien of een onverwachte git-staat: trigger `fix-my-mess`. Bewaar niet-gecommitte wijzigingen altijd eerst met een stash-backup voordat een branchwissel, reset of revert bestaande inhoud kan overschrijven.

## Bij start van een sessie

Bij de **eerste boodschap** van een nieuwe sessie:

1. Begroet de gebruiker alleen, vraagt die om hulp of weet die niet waar te beginnen: trigger `welkom` en wacht op de volgende boodschap.
2. Geeft de gebruiker een concrete opdracht (bijv. "maak de knop groen"): voer die meteen uit. Start bij websitewijzigingen eerst de preview volgens bovenstaande routine.
3. Is de repo nog niet ingericht (geen `node_modules`, geen Vercel-koppeling) en wil de gebruiker aan de slag: bied `setup-machine` aan.

Maximaal één keer per sessie. Zit je in een vervolgboodschap, behandel die direct zonder welkom.

## Wat NOOIT mag

- `git push --force` of `git push --force-with-lease`
- `git reset --hard` om werk op te ruimen
- `git add -A` bij publiceren (alleen toegestaan bij de allereerste commit van een verse repo)
- `rm -rf .git/`
- `--no-verify` op een commit (skip de hooks niet)
- `--ignore-minimum-release-age` bij pnpm

## Wat te doen als iets onduidelijk is

Vraag het. Een korte verduidelijkingsvraag is beter dan een verkeerde aanname die later teruggedraaid moet worden.
