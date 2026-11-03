// keybars: notifications from the apps you choose light your keyboard,
// through keybars Pro's keybars-pro command.
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {alertArgs, candidates, wanted} from './lib.js';

export default class KeybarsExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        const tray = Main.messageTray;
        tray.connectObject('source-added', (_, source) => this._watch(source), this);
        // sources already there, from before the extension started
        for (const source of tray.getSources())
            this._watch(source);
    }

    disable() {
        Main.messageTray.disconnectObject(this);
        for (const source of Main.messageTray.getSources())
            source.disconnectObject(this);
        this._settings = null;
    }

    _watch(source) {
        source.connectObject('notification-added', () => this._notified(source), this);
    }

    _notified(source) {
        const name = source.title;
        const id = source.policy?.id;
        if (!wanted(this._settings.get_strv('apps'), this._settings.get_boolean('all-apps'), name, id))
            return;
        this._run(alertArgs(name || id));
    }

    _command() {
        const home = GLib.get_home_dir();
        const found = candidates(this._settings.get_string('command'), home)
            .find(p => GLib.file_test(p, GLib.FileTest.IS_EXECUTABLE));
        return found ?? 'keybars-pro';
    }

    // runs keybars-pro without waiting on it, so the shell never stalls
    _run(args) {
        try {
            Gio.Subprocess.new([this._command(), ...args],
                Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE);
        } catch (e) {
            console.warn(`keybars: couldn't run keybars-pro: ${e.message}`);
        }
    }
}
