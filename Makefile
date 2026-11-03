UUID = keybars@keybars.app

.PHONY: lint test shell check pack install

lint:
	npx oxlint
	sh -n tests/shell.sh

test:
	node --test tests/lib.test.js

# the extension in a headless GNOME Shell; skipped without one
shell:
	sh tests/shell.sh

check: lint test shell

pack:
	mkdir -p dist
	gnome-extensions pack $(UUID) --force --out-dir dist --extra-source=lib.js

install: pack
	gnome-extensions install --force dist/$(UUID).shell-extension.zip
