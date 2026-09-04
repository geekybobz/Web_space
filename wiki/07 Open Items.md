# Open Items

← [[00 Home]]

## Move the CV builder to a separate repository

After the profile contract has been used for a while, move `cv_workspace/` into
its own project. Replace its temporary local path with a configurable profile
source that accepts either the hosted `/api/profile/current/` URL or a read-only
local profile checkout. Add its own private-data and generated-output rules.

## Add contract evolution checks

Before introducing a breaking profile change, add a compatibility comparison so
CI can distinguish ordinary content updates from changes that require `v2`.

## Optional package adapter

If Python consumers become common, add a tiny read-only loader package. The JSON
manifest remains the language-neutral primary interface; a package must not
become a second source of truth.

## Browser regression coverage

The current checks validate generated files, local links, IDs, profile references,
and representative content. A later change can add browser interaction tests for
page navigation, expand/collapse controls, and the preview panel.
