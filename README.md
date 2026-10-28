# ERP System — client apps

Web app, Platform Console and desktop app for the ERP System, with the packages they share. Built
with pnpm workspaces and Turborepo. The API and the background worker live in
[ERP-Backend](https://github.com/annsabbasi/ERP-Backend) (see `docs/adr/0003-server-and-client-repositories.md`).

The previous build (installer 1.0.3) is kept, read-only, on branch `backup/2026-10-22-pre-rebuild`;
its old branches are tags under `legacy/`. New code does not come from there unless a task says so.

## Prerequisites

- Node.js 22 (`.nvmrc`)
- pnpm 10, through Corepack: `corepack enable`
- A running API: clone [ERP-Backend](https://github.com/annsabbasi/ERP-Backend) next to this
  repository and follow its README (it needs Docker Desktop for the local database)

## Set up

```sh
corepack enable
pnpm install
git config core.hooksPath .githooks   # commit checks, see docs/adr/0004-direct-commits-to-main.md
cp .env.example .env        # local settings; never commit .env
```

Development is local-only until go-live (`docs/adr/0007-local-only-until-go-live.md`); the full
runbook, with ports and troubleshooting, is `docs/local-dev.md`.

## Run

Start the API first (`pnpm local:up`, then `pnpm dev`, in ERP-Backend), then here:

```sh
pnpm dev          # web, console and desktop together
```

| App              | Address                                                          |
| ---------------- | ---------------------------------------------------------------- |
| Web app          | http://localhost:5173 (shows whether it can reach the API)       |
| Platform Console | http://localhost:5174                                            |
| Desktop          | Electron window that loads the web app                           |
| API              | http://localhost:3000/api/v1, from ERP-Backend (`VITE_API_BASE`) |

Other commands, all run through Turborepo: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.

## Shared contracts

`packages/contracts` (request and response shapes) is owned by ERP-Backend. This repository keeps an
exact copy, and the CI job `contracts` fails when it differs from ERP-Backend `main`. Never change
it here first: push the change to ERP-Backend `main`, then copy it over from a clone next to this
one and push the copy here the same day:

```sh
rm -rf packages/contracts
git -C ../ERP-Backend archive main packages/contracts | tar -x
```

## How changes land

All work is committed straight to `main`: no feature branches, no pull requests
(`docs/adr/0004-direct-commits-to-main.md`).

- Every commit is authored and pushed as `annsabbasi <annsabbasi54@gmail.com>`, with no co-author
  or generated-by lines. The `commit-msg` hook (Set up, above) and the CI job `commit-hygiene`
  refuse anything else.
- Before every push, `pnpm turbo run lint typecheck test build` passes locally. After the push, CI
  must be green before the next batch starts. A red `main` is fixed forward the same day; never
  force-push.
- Commits are small, follow Conventional Commits (`feat(web): …`), build on their own, and name the
  specification section in the body (`Spec: Part 04 §4.9.2`).
- Unfinished screens stay behind feature flags until their stage passes QA.

To check the history yourself: `sh .github/scripts/commit-hygiene.sh`.

## Folder map

```text
apps/
  web/            React web app (Vite, Tailwind CSS, TanStack Router and Query)
  console/        React Platform Console (Vite)
  desktop/        Electron shell around the web app
packages/
  contracts/      Zod schemas and types shared with the API (copy of ERP-Backend's)
  ui/             Design tokens and shared React components
  i18n/           Translations (English) and the i18next loader
  sdk/            Typed API client (empty for now)
  auth-client/    Client-side sign-in and session handling (empty for now)
  sync/           Offline store and sync for the desktop app (empty for now)
  config/         Shared TypeScript, ESLint and Prettier configuration
docs/adr/         Architecture decision records
.githooks/        Git hooks (git config core.hooksPath .githooks)
.github/          CI workflow and its scripts
```
