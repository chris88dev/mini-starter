# Mini Starter

A minimal **Next.js 16 + Tailwind v4** starter, pre-wired for AI-assisted building with **Claude Code** (and Codex). Clone it, point an agent at it, and go from empty machine to a live site — the built-in skills handle setup, preview, publishing, performance checks, and recovery.

You work **directly on `main`** and deploy through the **Vercel CLI**. Git + GitHub are the safety net (history, backups), not the deploy trigger.

## Quick start

```bash
git clone https://github.com/chris88dev/mini-starter.git my-project
cd my-project
claude            # open Claude Code in this folder (or run `codex`)
```

Then just talk to the agent:

- **First time on this machine?** Say **`setup`** — it installs the tools (Homebrew, Node 22, pnpm, agent-browser, Vercel CLI), logs you into GitHub + Vercel, links the project, and runs the first production deploy, continuing until your site is live.
- **Already set up?** Say **`start`** to run the local preview, then describe changes in plain language.

On the **first run of a fresh clone**, the agent does a short onboarding — it asks your project name and what the site is about, then personalizes the repo for you (no coding needed).

## Hand it to an agent

Point Claude Code at this repo and let it do the whole thing. Paste a prompt like:

```
Clone https://github.com/chris88dev/mini-starter into ./my-project,
open it, and run the "setup" skill — walk me through it until my site is live.
```

## What's inside

Talk in natural language; the agent triggers the right skill automatically.

| Say | What happens |
| --- | --- |
| `setup` | Empty machine + accounts → tools installed, logged in, first deploy live |
| `start` | Dev server + live preview on `localhost:3000` |
| `change the title to ...` | Edit + visual check on desktop and mobile |
| `crop this photo to 16:9` | Crop/resize a site image into `public/` |
| `how fast is my site?` | Core Web Vitals (PageSpeed Insights / Lighthouse), in plain language |
| `publish` | Commit on `main` + `vercel --prod`, returns the production URL |
| `is the deploy done?` | Status of the latest Vercel deploy |
| `fix` / `undo` | Back to a working version, with an automatic backup |

## Manual (without the agent)

```bash
pnpm install     # dependencies
pnpm dev         # run locally
pnpm build       # test a production build
vercel --prod    # deploy to production
```

## Notes

- **Package manager:** pnpm (version pinned in `package.json`). A 5-day supply-chain cooldown is set in `pnpm-workspace.yaml`.
- **Skills** live in `.claude/skills/` and are mirrored to `.agents/skills/` via a symlink, so Claude Code and Codex share the exact same workflows. Keep `CLAUDE.md` and `AGENTS.md` identical (`pnpm run check:skills` enforces this).
- **Dutch user guide:** see [`LEESMIJ.md`](LEESMIJ.md). The agent's own instructions live in [`CLAUDE.md`](CLAUDE.md).
