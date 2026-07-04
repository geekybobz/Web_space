# Site Context

Fast handoff for any LLM working this repo. Read `wiki/00 Home.md` for full project knowledge.

## Key Rules

1. **Never edit generated files** — always edit the source and rebuild. See `wiki/04 Build System.md` for the source-of-truth table.
2. **Use `webspace` alias** to rebuild and serve. Never spin up manual servers or use preview tools.
3. **Commit messages** — use only the user's message verbatim. No Co-Authored-By or attribution lines.
4. **CV work** — use the `/tailor-cv` skill. Never write or compile LaTeX until the user explicitly approves all sections.
5. **Change preview protocol** — for Web_space UI/content/design changes, follow `wiki/08 Change Preview Protocol.md`: intake, design gate, source-only edits, rebuild, preview with the correct `webspace` command, and return that exact command to the user.
