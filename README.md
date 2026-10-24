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

## Run

Start the API first (`pnpm dev` in ERP-Backend), then here:

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
it here first: merge the change in ERP-Backend, then copy it over from a clone next to this one:

```sh
rm -rf packages/contracts
git -C ../ERP-Backend archive main packages/contracts | tar -x
```

## Folder map

```text
apps/
  web/            React web app (Vite, Tailwind CSS, TanStack Router and Query)
  console/        React Platform Console (Vite)
  desktop/        Electron shell around the web app
packages/
  contracts/      Zod schemas and types shared with the API (copy of ERP-Backend's)
  ui/             Design tokens and shared React components
  i18n/           Translations (en, ur) and the i18next loader
  sdk/            Typed API client (empty for now)
  auth-client/    Client-side sign-in and session handling (empty for now)
  sync/           Offline store and sync for the desktop app (empty for now)
  config/         Shared TypeScript, ESLint and Prettier configuration
docs/adr/         Architecture decision records
```
