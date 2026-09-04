# Development Workflow

← [[00 Home]]

## Local preview

`local_run.sh` builds, validates, starts the local preview server, and opens:

```text
http://localhost:2026/dist/index.html?localPreview=1
```

The preferred wrapper is the `webspace` zsh function:

```bash
webspace current
webspace main
webspace branch <branch-name>
webspace status
webspace stop
```

For phone testing, start the normal preview, enable WiFi preview from the local
panel, then open `http://<laptop-LAN-IP>:2032/dist/index.html`.

## Safe edit cycle

1. Check `git status --short`; preserve unrelated work.
2. Edit canonical profile facts in `profile/` and presentation/behavior in `website/`.
3. Build and run validation/tests.
4. Preview the current checkout when visual verification is requested.
5. Stage only the intended source, tests, and documentation. Never stage `dist/` or `cv_workspace/`.
6. Show the staged diff and proposed commit message; commit only after approval.
