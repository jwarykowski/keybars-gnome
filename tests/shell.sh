#!/bin/sh
# The extension in a real GNOME Shell: headless, in a D-Bus session and XDG
# folders of its own (your desktop and settings aren't touched), sending real
# notifications to it and checking what reached a fake keybars-pro.
set -eu

command -v gnome-shell >/dev/null || {
  echo "skip: no gnome-shell"
  exit 0
}

root=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
uuid=keybars@keybars.app

export XDG_DATA_HOME="$tmp/data" XDG_CONFIG_HOME="$tmp/config" XDG_CACHE_HOME="$tmp/cache" \
  XDG_STATE_HOME="$tmp/state" XDG_RUNTIME_DIR="$tmp/run"
mkdir -p "$XDG_RUNTIME_DIR" "$XDG_DATA_HOME/gnome-shell/extensions"
chmod 700 "$XDG_RUNTIME_DIR"
cp -r "$root/$uuid" "$XDG_DATA_HOME/gnome-shell/extensions/"
glib-compile-schemas "$XDG_DATA_HOME/gnome-shell/extensions/$uuid/schemas"

log="$tmp/keybars.log"
printf '#!/bin/sh\necho "$*" >>"%s"\n' "$log" >"$tmp/keybars-pro"
chmod +x "$tmp/keybars-pro"

cat >"$tmp/run.sh" <<EOF
set -eu
schemas="$XDG_DATA_HOME/gnome-shell/extensions/$uuid/schemas"
gsettings set org.gnome.shell disable-user-extensions false
gsettings set org.gnome.shell enabled-extensions "['$uuid']"
gsettings --schemadir "\$schemas" set org.gnome.shell.extensions.keybars command "$tmp/keybars-pro"
gsettings --schemadir "\$schemas" set org.gnome.shell.extensions.keybars apps "['Slack']"

gnome-shell --headless --virtual-monitor 1280x720 --wayland-display keybars-test-wl >"$tmp/shell.log" 2>&1 &
shell=\$!
trap 'kill \$shell 2>/dev/null || true' EXIT
i=0
until gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell \
  --method org.freedesktop.DBus.Properties.Get org.gnome.Shell ShellVersion >/dev/null 2>&1; do
  i=\$((i + 1))
  [ \$i -lt 100 ] || { echo "gnome-shell didn't start:"; tail -20 "$tmp/shell.log"; exit 1; }
  sleep 0.2
done
state=\$(gdbus call --session --dest org.gnome.Shell.Extensions --object-path /org/gnome/Shell/Extensions \
  --method org.gnome.Shell.Extensions.GetExtensionInfo "$uuid" | grep -o "'state': <[0-9.]*>" || true)
echo "extension \$state"

notify-send -a Slack "Build" "it passed"
notify-send -a Mail "Lunch" "soon"
sleep 2
EOF

fails=0
env -u WAYLAND_DISPLAY -u DISPLAY dbus-run-session -- sh "$tmp/run.sh" 2>"$tmp/session.log" | tee "$tmp/out"
if grep -q "'state': <1" "$tmp/out"; then echo "ok: the extension is enabled"; else
  echo "FAIL: the extension isn't enabled" >&2
  grep -i keybars "$tmp/shell.log" >&2 || true
  fails=1
fi
if [ "$(cat "$log" 2>/dev/null)" = "alert -q -repo Slack desktop.notification" ]; then
  echo "ok: Slack's notification sent, Mail's not"
else
  echo "FAIL: sent: $(cat "$log" 2>/dev/null)" >&2
  grep -i -A3 keybars "$tmp/shell.log" >&2 || true
  fails=1
fi
exit "$fails"
