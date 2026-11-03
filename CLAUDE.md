# keybars for GNOME

A GNOME Shell extension (`keybars@keybars.app/`) that sends chosen apps'
notifications to keybars Pro as `desktop.notification`. README.md has the
detail; this file is what to keep in mind while working here.

## Commands

- `make check`: oxlint, `node --test` on `lib.js`, then `make shell`, which
  runs the extension in a headless GNOME Shell (own D-Bus session and XDG
  folders) and sends it real notifications. CI only lints and runs the logic
  tests: its image has no GNOME Shell.
- `make pack`, `make install`.

## Keep in mind

- `lib.js` imports nothing from GNOME, so Node can test it; put decisions
  there and keep `extension.js` to wiring.
- `metadata.json`'s `shell-version` lists only versions `make shell` has
  run on. The notification hooks (`source-added`, `notification-added`,
  `source.policy.id`) are GNOME 46+ API; check a version before adding it.
- Commands go through `Gio.Subprocess` without waiting: the shell must
  never block on keybars Pro.
- A new setting: the schema, `prefs.js`, and `glib-compile-schemas` runs
  in `make shell` and at install.

## Related repos (in ~/development)

- `keybars-pro`: the app and the `keybars-pro` command (`alert`).
- `keybars-kde`: the same idea for Plasma.
