---
name: setup-machine
description: Zet een verse Mac én de accounts volledig klaar en gaat door tot de site voor het eerst live staat. Installeert Homebrew, Node 22 LTS, Git, pnpm via Corepack, agent-browser en de Vercel CLI; richt Git-identity in; logt in op GitHub (backup-remote) en Vercel; en doet de eerste productie-deploy. Gebruik bij "setup", "richt mijn computer in", "eerste keer", "zet de site online", of wanneer start-site/publish-changes een tool of login mist. Slaat stappen over die al gedaan zijn.
---

# Setup: van verse Mac tot live site

Doel: doorlopen tot er een **echte productie-URL** is. Sla alles over dat al werkt. Werk stap voor stap; stop niet halverwege zonder de gebruiker te informeren.

Deploy-model van deze repo: je werkt **direct op `main`** en deployt met **`vercel --prod`** via de Vercel CLI. Git + GitHub zijn het vangnet (historie/backup), niet de deploy-trigger.

## Werk vanuit de repo-root

Voer **alle** commando's in deze skill uit vanuit de **hoofdmap van het project** (de map met `package.json` en `.git`). `gh`, `git`, `vercel` en `agent-browser` zijn globale machine-tools die je **direct** aanroept — **niet** via `npx` en **niet** als script in `package.json`. Vooral `gh repo create --source=.`, `vercel link` en alle `git`-commando's werken op de huidige map; sta je in een submap, dan koppelen of committen ze het verkeerde project.

Controleer bij twijfel waar je staat en ga desnoods naar de root:

```
pwd
git rev-parse --show-toplevel
```

## Stap 1: Homebrew

```
command -v brew
```

Afwezig — zeg vooraf: "Ik installeer eerst Homebrew, de basis om de andere tools op te halen. Duurt 2–5 minuten; mogelijk vraagt je Mac om een wachtwoord."

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Activeer daarna in deze terminal (Apple Silicon = `/opt/homebrew`, Intel = `/usr/local`):

```
test -x /opt/homebrew/bin/brew && eval "$(/opt/homebrew/bin/brew shellenv)"
test -x /usr/local/bin/brew && eval "$(/usr/local/bin/brew shellenv)"
brew --version
```

Zorg dat het in nieuwe terminals blijft werken (kies het bestaande pad):

```
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
```

Faalt Homebrew: stop, leg uit wat misging, ga niet door naar de rest.

## Stap 2: Node.js 22 LTS

```
node --version
```

Afwezig, lager dan 20, of 25+:

```
brew install node@22
brew link --overwrite --force node@22
node --version
```

Node 22 LTS levert Corepack nog mee (vanaf Node 25 niet meer standaard).

## Stap 3: Git

```
git --version
```

Afwezig: `brew install git`

## Stap 4: Corepack activeren (pnpm-versie uit package.json)

```
command -v corepack
corepack enable
pnpm --version
```

Ontbreekt `corepack` ondanks Node 22:

```
npm install -g corepack
corepack enable
pnpm --version
```

`pnpm` moet `10.18.0` gebruiken (uit `packageManager`).

## Stap 5: agent-browser (visuele controle)

`agent-browser` is een machine-tool, geen dependency van de site — installeer nooit met `pnpm add`.

```
command -v agent-browser
agent-browser --version
```

Afwezig: `brew install agent-browser` (fallback als brew faalt maar node/npm werken: `npm install -g agent-browser`).

Daarna, en wanneer de testbrowser ontbreekt:

```
agent-browser install
agent-browser doctor
```

## Stap 6: Git-repo, identity en eerste commit

Deze repo hoort een git-repo te zijn met `main` als branch. Check en richt in:

```
git rev-parse --is-inside-work-tree 2>/dev/null
```

Geen repo:

```
git init -b main
```

Identity (globaal), alleen als leeg:

```
git config --global user.name
git config --global user.email
```

Leeg: vraag naam en e-mail en zet:

```
git config --global user.name "Voor- Achternaam"
git config --global user.email "jij@example.com"
```

Nog geen commit? Maak een eerste terughaalpunt:

```
git add -A
git commit -m "Eerste versie mini-starter"
```

> Uitzondering op de "nooit `git add -A`"-regel: alleen bij deze allereerste commit van een nieuwe repo is het volledig stagen prima. Daarna gelden de normale publiceer-regels (alleen bedoelde bestanden).

## Stap 7: GitHub CLI + login (backup-remote)

GitHub is hier het vangnet: je code staat er veilig en `fix-my-mess` kan ernaartoe terugvallen. De deploy loopt níet via GitHub.

```
command -v gh
```

Afwezig: `brew install gh`

```
gh auth status
```

Niet ingelogd:

```
gh auth login --web --git-protocol https
```

Kies: GitHub.com → HTTPS → Yes (authenticate Git) → Login with web browser. Geef de gebruiker de 8-cijferige code; de browser opent automatisch. Vraag de flow af te ronden.

### Een eigen private GitHub-repo aanmaken en koppelen

Dit project hoort onder een **eigen private repo** te staan, niet onder de template-starter. Bekijk eerst de huidige remote:

```
git remote get-url origin 2>/dev/null || echo "geen origin"
```

- **Wijst `origin` al naar een eigen project-repo** (dus NIET de template — de template-URL bevat `mini-starter`): dan is dit al goed. Sla deze stap over.
- **Geen `origin`, óf `origin` wijst nog naar de template-starter** (URL bevat `mini-starter`): maak een eigen private repo aan.

Zo maak je de eigen private repo:

1. **Bepaal de naam.** Is `package.json` `"name"` al gepersonaliseerd door de onboarding (dus niet meer `mini-starter`), gebruik die als voorstel. Anders vraag: "Onder welke naam wil je dit project op GitHub?"
2. **Leid een repo-slug af** van die naam: kleine letters, spaties en leestekens worden koppeltekens, alleen `a-z 0-9 -` blijft over (bijv. "Petito's Proeverij" → `petitos-proeverij`).
3. **Controleer of de naam vrij is** onder je account: `gh repo view <slug>`. Bestaat hij al, stel een variant voor (bijv. `-site` erachter).
4. **Ontkoppel de template-remote** als `origin` nog naar de template wijst:
   ```
   git remote remove origin
   ```
5. **Maak de private repo, koppel als `origin` en push `main`:**
   ```
   gh repo create <slug> --private --source=. --remote=origin --push
   ```
6. Bevestig kort: "Private repo aangemaakt en gekoppeld: <url>."

Heeft de gebruiker geen GitHub of wil die dit overslaan: prima, ga door — GitHub is optioneel (de deploy loopt via Vercel, niet via GitHub). Vermeld wel dat er dan geen online backup is.

## Stap 8: Vercel CLI + login

```
command -v vercel
vercel --version
```

Afwezig — installeer de globale CLI (raakt de lockfile van de site niet):

```
npm install -g vercel
```

Login (opent de browser):

```
vercel whoami
```

Niet ingelogd:

```
vercel login
```

Kies "Continue with GitHub" (of e-mail). De browser opent; vraag de gebruiker het in te loggen en het te bevestigen. Controleer daarna opnieuw met `vercel whoami`.

## Stap 9: Project koppelen aan Vercel

```
vercel link --yes
```

Dit maakt/koppelt een Vercel-project aan deze map en schrijft `.vercel/` (staat in `.gitignore`). Bij vragen kies je het huidige mapname als projectnaam en het huidige account/team. Ontbreekt een project nog, dan maakt `vercel link` het aan.

## Stap 10: Eerste productie-deploy — doorgaan tot live

Zeg: "Alles staat klaar. Ik zet de site nu voor het eerst online."

Draai eerst een productie-bouw lokaal, zodat een fout niet pas op Vercel opduikt:

```
pnpm build
```

Slaagt de bouw, deploy naar productie:

```
vercel --prod
```

Wacht tot de CLI de definitieve **Production**-URL teruggeeft. Faalt de deploy: lees de output/logs, vat de fout in gewone taal samen, herstel en probeer opnieuw. Ga niet verder tot er een live URL is.

Bij succes, stuur:

> Je site staat live: [<PRODUCTIE_URL>](<PRODUCTIE_URL>)
>
> Vanaf nu: zeg "start" om lokaal te werken en "publiceer" om een wijziging live te zetten.

## Veelvoorkomende problemen

- **`brew` niet gevonden na install**: `eval "$(/opt/homebrew/bin/brew shellenv)"` (Apple Silicon) of `/usr/local` (Intel), dan opnieuw `brew --version`.
- **`corepack` niet gevonden**: controleer Node 22, dan de globale Corepack-herstelstap in stap 4.
- **`agent-browser` vindt geen browser**: `agent-browser install` opnieuw, dan `agent-browser doctor`.
- **`vercel login` opent geen browser**: kopieer de URL uit de terminal handmatig; controleer daarna `vercel whoami`.
- **`vercel --prod` faalt op de build**: reproduceer met `pnpm build` en fix de fout lokaal eerst.
- **Geen GitHub-account**: `github.com/signup`, daarna stap 7 opnieuw — of sla GitHub over (deploy werkt ook zonder).

## Optionele extra's (geen aparte install nodig)

Deze zijn niet nodig om live te gaan, maar zitten wel in de starter:

- **`crop-image`** (site-afbeeldingen bijsnijden/resizen): gebruikt macOS' ingebouwde `sips`, plus de al aanwezige `cwebp` voor webp. Geen install nodig. Ontbreekt `cwebp` toch, dan `brew install webp`.
- **`speedtest`** (Core Web Vitals meten): de productie-URL meet je via de PageSpeed Insights API (alleen internet nodig, geen install). Wil je de lokale preview meten, dan haalt `npx lighthouse` Lighthouse eenmalig op en is een Chrome/Chromium op de machine nodig.
