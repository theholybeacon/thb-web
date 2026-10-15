<!-- cockpit -->
## Cockpit

This repo uses [cockpit](https://github.com/andresrub10/cockpit) (`cockpit.toml`). Follow the `cockpit-work-issue` skill for any feature or fix.

- **Each worktree has its own environment** (`npx cockpit env up`, run when T3 Code creates it): its own copy of the dev database and `.env.local`, with its own `PORT`. Never point a worktree at a shared database or at another checkout's server (like `localhost:3000`); `npx cockpit env migrate` migrates the worktree's database.
- **E2e tests** in `e2e/` are explained step by step (`@andresrub10/cockpit/e2e`). Run them with `npx cockpit e2e test [files]`, never `playwright test` directly: it tests this worktree's app (starting it when needed) and writes the walkthrough.
- **Every change a user can see ends on its walkthrough**: run the e2e test that shows it, then start `npx cockpit e2e report --at <test id>` in the background: it opens the walkthrough in a window for the user (without a desktop, open the URL it prints in the T3 Code preview). That is how the change gets reviewed (skill `cockpit-e2e` for writing the test).
<!-- /cockpit -->
