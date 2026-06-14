# Dev Workflow

← [[00 Home]]

## webspace alias

Lives in `~/.shell_shortcuts.zsh`. Wraps `local_run.sh` with branch-awareness and server lifecycle.

| Command | Effect |
|---|---|
| `webspace` / `webspace current` | Launch preview on current branch |
| `webspace main` | Switch to `main` (if clean), then launch |
| `webspace branch <name>` | Switch to named branch (if clean), then launch |
| `webspace status` | Print branch, dirty/clean state, port 2026 usage |
| `webspace stop` | Kill preview server on port 2026 |
| `webspace help` | Print built-in usage summary |

**Port:** 2026
**Preview URL:** `http://localhost:2026/docs/index.html?localPreview=1`

## What webspace Does Internally

1. `cd` into `/Users/billabobz/Web_space`
2. Check TCP port 2026 — force-kill any process using it with `kill -9`
3. Run `local_run.sh`

Note: `webspace` is a zsh function, not a standalone executable. Not available in non-interactive shells unless `~/.shell_shortcuts.zsh` is sourced explicitly.

## What local_run.sh Does

1. `python3 tools/build_index.py --asset-version <unix timestamp>` — rebuild + cache-bust
2. Start `tools/local_preview_server.py --port 2026` in background
3. Open preview URL in browser
4. Wait on the server process

## Branch Switching Rule

Branch switching is **blocked when the worktree is dirty**. Commit or stash first:

```bash
git stash
webspace branch <name>
```

## Phone / LAN Preview

1. Start `webspace` normally (desktop on port 2026)
2. Click **Start WiFi :2032** in the local preview panel
3. Open `http://<laptop-LAN-IP>:2032/docs/index.html` on phone

Port 2032 runs in parallel and does not interfere with the 2026 desktop preview. The `kill -9` in `webspace` only targets port 2026. Phone uses a different port because `localhost` on a phone points to the phone itself.

## Editing Workflow

1. Edit source files in `docs/sections/`, `docs/css/src/`, `docs/js/src/`, or `docs/data/`
2. Run `webspace` to rebuild + preview
3. Never edit generated files — see [[04 Build System]] for the source-of-truth table

## Related

- [[04 Build System]] — what gets rebuilt and why
- [[03 Web Layer]] — local preview panel endpoints and phone testing details
