<!-- cockpit -->
## Cockpit

This repo uses [cockpit](https://github.com/andresrub10/cockpit) (`cockpit.toml`):

- Each worktree has its own environment (`npx cockpit env up`): its own copy of the dev database and `.env.local`. Never point a worktree at a shared database; `npx cockpit env migrate` migrates the worktree's.
- E2e tests in `e2e/` are explained, step by step (`@andresrub10/cockpit/e2e`): `npx cockpit e2e test` runs them and writes the walkthrough; `npx cockpit e2e report` serves it.
- The cockpit skills (Claude Code plugin `cockpit`) cover working an issue, writing e2e tests and planning.
<!-- /cockpit -->
