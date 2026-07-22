# Instructies voor deze website

<!-- onboarding: pending -->
**Project:** _nog niet ingesteld — de `welkom`-skill vult dit bij de eerste sessie in._

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

## Agent teams (delegeren is de standaard)

De **main thread** (waar de gebruiker mee praat) is de orchestrator en **delegeert standaard**: zet niet-triviaal werk uit naar **subagents op Opus 4.8** of een **agent team**, in plaats van het zelf sequentieel af te handelen. Alleen echt triviale dingen doe je direct.

- **Subagents/agents draaien op Opus 4.8** (`claude-opus-4-8`, het maximale model) voor het echte denk- en codeerwerk. Eenvoudige deeltaken mogen een lichter model kiezen.
- **Fable** (`claude-fable-5`) gebruiken we specifiek voor **research bij moeilijke taken** (opties verkennen, web-research, een tweede invalshoek) — niet als standaard-orchestrator.
- Zet onafhankelijke taken in één keer als aparte subagents uit (parallel); wacht niet nodeloos sequentieel.
- Houd gedeelde staat (dev-server, `node_modules`, git-index, en bestanden als CLAUDE.md/AGENTS.md/settings.json) bij één agent om conflicten te voorkomen; isoleer parallelle bestandswijzigingen (aparte bestanden of worktree-isolatie).

## Package manager

- Deze repo gebruikt **pnpm** (versie staat in `package.json` bij `packageManager`).
- Gebruik nooit `npm` of `yarn` voor dependencies van de site — dat verpest de lockfile.
- Machine-tools (`agent-browser`, `vercel`) worden globaal geïnstalleerd (Homebrew of npm-global) via `setup-machine`; die raken de lockfile niet.
- `gh`, `git`, `vercel` en `agent-browser` roep je **direct** aan vanuit de **repo-root** — niet via `npx` en niet als `package.json`-script. `gh repo create --source=.`, `vercel link` en `git`-commando's werken op de huidige map, dus vanuit een submap koppelen/committen ze het verkeerde project.
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
- `pull-changes` - haalt updates op en mergt veilig: template-updates (upstream, slimme merge die je personalisaties beschermt) of je eigen laatste versie (origin, multi-machine)

Trigger deze skills automatisch op natuurlijke taal. Wacht niet tot de gebruiker de skill bij naam noemt.

De skillbron staat in `.claude/skills`; `.agents/skills` is een symlink naar dezelfde map zodat Claude en Codex exact dezelfde workflows gebruiken. Pas skills alleen in `.claude/skills` aan en voer daarna `pnpm run check:skills` uit. Houd `AGENTS.md` en `CLAUDE.md` inhoudelijk gelijk.

## Browsergebruik: altijd agent-browser

Voor **elke** browsertaak — previews openen, screenshots, klikken, formulieren invullen, testen, scrapen — gebruik je altijd de **`agent-browser`** CLI. Gebruik **niet** de ingebouwde Claude-browser of een Chrome/browser-MCP; `agent-browser` is de enige browser-tool in deze werkruimte. Ontbreekt de CLI of kan die geen browser openen, gebruik dan `setup-machine` (die installeert `agent-browser` en draait `agent-browser install`).

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

0. **Onboarding-check:** staat de onboarding-marker bovenaan dit bestand (de HTML-commentregel direct onder de titel) nog op *pending*, dan is dit een verse kloon. Trigger `welkom`; die doet eerst een korte onboarding (projectnaam, type site) en personaliseert daarna deze `CLAUDE.md` (en `AGENTS.md`). Doe dit vóór de opties hieronder.
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
