# Local development

The whole system runs on one PC and nothing deploys (`docs/adr/0007-local-only-until-go-live.md`).
This repository runs the web app, the Platform Console and the desktop app. They call the API from
[ERP-Backend](https://github.com/annsabbasi/ERP-Backend) over localhost. ERP-Backend's
`docs/local-dev.md` covers the API, the worker and the Docker services; read it first.

## Prerequisites

- ERP-Backend cloned next to this repository and set up as its `docs/local-dev.md` says
- Node.js 22 (`.nvmrc`) and pnpm 10 through Corepack (`corepack enable`)
- Windows: the desktop app runs unsigned Electron in development; see Troubleshooting

## First time

```sh
corepack enable
pnpm install
git config core.hooksPath .githooks
cp .env.example .env        # VITE_API_BASE=http://localhost:3000/api/v1
```

The first desktop start downloads the Electron binary (about 360 MB) into `node_modules`.

## Start and stop

1. In ERP-Backend: `pnpm local:up`, then `pnpm dev` (API on 3000).
2. Here: `pnpm dev`. It starts the web app and the Platform Console, waits until the web app answers,
   then opens the desktop window.

| App              | Address                                                        |
| ---------------- | -------------------------------------------------------------- |
| Web app          | http://localhost:5173: shows "API: ok" when it reaches the API |
| Platform Console | http://localhost:5174                                          |
| Desktop          | The "ERP System" window, which loads the web app               |

To stop: Ctrl+C here (closes the desktop window too), then stop ERP-Backend as its runbook says.

## Ports

| Port | Service                                  |
| ---- | ---------------------------------------- |
| 5173 | Web app (also loaded by the desktop app) |
| 5174 | Platform Console                         |
| 3000 | API, from ERP-Backend (`VITE_API_BASE`)  |

The API allows calls from 5173 and 5174 only (`CORS_ORIGINS` in ERP-Backend's `.env`). If you move
the web app or the console to another port, add it there too.

## Test accounts

Passwords are never written here; they come from ERP-Backend's local `.env`, and its runbook lists
the accounts as each stage adds them.

## Troubleshooting

| Symptom                                                        | Fix                                                                                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The web app shows "API: unreachable"                           | Start the API (`pnpm dev` in ERP-Backend), then press "Check again". Check `VITE_API_BASE` in `.env`                                                           |
| "Port 5173 is in use" or the console starts on another port    | Stop the other program using it (`netstat -ano \| findstr :5173` on Windows); the desktop app and `CORS_ORIGINS` expect 5173 and 5174                          |
| The desktop window never opens                                 | It waits for http://localhost:5173. Make sure the web app started; look for errors in the `@erp/desktop:dev` lines                                             |
| "Electron failed to install correctly"                         | Run `pnpm install` again; the binary downloads on first start                                                                                                  |
| Windows: "An Application Control policy has blocked this file" | Smart App Control blocked an unsigned program. Electron 45 runs on this PC today; Event Viewer › CodeIntegrity › Operational, event 3077, names a blocked file |
