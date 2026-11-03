import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import {parseApps} from './lib.js';

export default class KeybarsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage();

        const which = new Adw.PreferencesGroup({
            title: 'Notifications',
            description: 'Each one sends desktop.notification to keybars Pro, with the app’s name as the repository. ' +
                'Add a rule for it on keybars Pro’s Alerts page.',
        });
        const all = new Adw.SwitchRow({title: 'Every app', subtitle: 'Not only the apps below'});
        settings.bind('all-apps', all, 'active', Gio.SettingsBindFlags.DEFAULT);
        which.add(all);

        const apps = new Adw.EntryRow({title: 'Apps, by name or ID, separated by commas'});
        apps.set_text(settings.get_strv('apps').join(', '));
        apps.connect('changed', () => settings.set_strv('apps', parseApps(apps.get_text())));
        settings.bind('all-apps', apps, 'sensitive', Gio.SettingsBindFlags.INVERT_BOOLEAN);
        which.add(apps);
        page.add(which);

        const where = new Adw.PreferencesGroup({title: 'keybars Pro'});
        const command = new Adw.EntryRow({title: 'keybars-pro command, if it isn’t found'});
        settings.bind('command', command, 'text', Gio.SettingsBindFlags.DEFAULT);
        where.add(command);
        page.add(where);

        window.add(page);
        window.set_default_size(560, 420);
    }
}
