# keybars for GNOME

A GNOME Shell extension for [keybars Pro](https://keybars.app/pro/):
notifications from the apps you choose light your keyboard. A message on
Slack, a meeting about to start, a download done.

Each notification from a chosen app sends `desktop.notification` to keybars
Pro's alert rules, with the app's name as the repository, so a rule can
light something different for each app:

```sh
keybars-pro rules add "Slack" desktop.notification -repo Slack -keys esc -colour "#4a154b" -effect pulse -for 10s
```

## requirements

- keybars Pro running, with its command installed: App settings, Command
  line, **Install the command-line tool**
- GNOME Shell 50

## install

From a release's `keybars@keybars.app.shell-extension.zip`:

```sh
gnome-extensions install keybars@keybars.app.shell-extension.zip
```

then log out and in, and turn it on in Extensions. From the source:
`make install`.

## settings

In Extensions, keybars, the cog:

- **Every app**, or **Apps** by name (`Slack`) or ID (`com.slack.Slack`),
  separated by commas
- **keybars-pro command**, if it isn't in `/usr/bin`, `/usr/local/bin` or
  `~/.local/bin`

## development

```sh
npm ci
make check   # oxlint, the logic's tests, then the extension in a headless GNOME Shell
make pack    # dist/keybars@keybars.app.shell-extension.zip
```

`make shell` starts GNOME Shell headless, in a D-Bus session and XDG folders
of its own (your desktop and settings aren't touched), enables the
extension, sends notifications with `notify-send` and checks what reached a
fake `keybars-pro`.

## licence

MIT
