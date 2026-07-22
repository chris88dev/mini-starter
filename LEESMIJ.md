# Mini Starter

Een minimale Next.js 16 + Tailwind v4 boilerplate met ingebouwde AI-skills om
te starten, previewen, publiceren en herstellen. Je werkt **direct op `main`**
en deployt via de **Vercel CLI**.

## In één zin

Open deze map in Claude Code (of Codex) en zeg wat je wilt — de skills doen de rest.

## Eerste keer op een nieuwe computer

Zeg **"setup"**. De `setup-machine`-skill loopt door:

1. Homebrew, Node 22 LTS, Git, pnpm (Corepack), agent-browser
2. Git-repo + identity, GitHub-login (backup), Vercel CLI + login
3. Project koppelen aan Vercel en de **eerste productie-deploy** — door tot de site live staat.

## Dagelijks gebruik

| Je zegt | Wat er gebeurt |
| --- | --- |
| `start` | Dev-server + live preview op `localhost:3000` |
| `verander ...` | Wijziging + visuele controle op desktop en mobiel |
| `publiceer` | Commit op `main` + `vercel --prod`, productie-URL terug |
| `is de deploy klaar?` | Status van de laatste Vercel-deploy |
| `fix` / `draai terug` | Terug naar een werkende versie, met backup |
| `hoe snel is mijn site?` | Core Web Vitals van je productie- of preview-site |
| `snijd deze foto bij tot 16:9` | Site-afbeelding croppen/resizen naar `public/` |
| `haal template-updates op` / `sync` | Updates uit de starter-template of je eigen repo veilig mergen |

## Handmatig (zonder skills)

```bash
pnpm install     # dependencies
pnpm dev         # lokaal draaien
pnpm build       # productie-bouw testen
vercel --prod    # deployen naar productie
```

## Structuur

- `app/` — Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`)
- `.claude/skills/` — de skillbron (Claude + Codex via de `.agents/skills` symlink)
- `CLAUDE.md` / `AGENTS.md` — instructies voor de AI-assistent (inhoudelijk gelijk)
- `scripts/check-skill-mirrors.mjs` — bewaakt de symlink en gelijke instructies (`pnpm run check:skills`)

## Aanpassen

- Merkkleuren: `app/globals.css` (CSS-variabelen, incl. dark mode).
- Startpagina: `app/page.tsx`.
- Nieuwe pagina: maak `app/<pad>/page.tsx`.
