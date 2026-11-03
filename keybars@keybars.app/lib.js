// What the extension decides, without GNOME Shell, so it can be tested with
// plain Node.

/** The event a notification sends; the app goes as its repository. */
export const EVENT = 'desktop.notification';

const norm = s => (s ?? '').trim().toLowerCase().replace(/\.desktop$/, '');

/**
 * Whether a notification from an app (its name, and its ID when GNOME knows
 * it) is one to send: every app's, or one listed by name or ID.
 */
export function wanted(apps, allApps, name, id) {
    if (allApps)
        return true;
    const n = norm(name);
    const i = norm(id);
    return apps.some(a => {
        const want = norm(a);
        return want !== '' && (want === n || want === i);
    });
}

/** keybars-pro's arguments for a notification from an app. */
export function alertArgs(app) {
    const args = ['alert', '-q'];
    if (app)
        args.push('-repo', app);
    args.push(EVENT);
    return args;
}

/** Where keybars-pro may be: the shell's PATH may not have ~/.local/bin. */
export function candidates(setting, home) {
    const out = [];
    if (setting && setting.trim() !== '')
        out.push(setting.trim().replace(/^~(?=\/)/, home));
    out.push('/usr/bin/keybars-pro', '/usr/local/bin/keybars-pro', `${home}/.local/bin/keybars-pro`);
    return out;
}

/** Splits the preferences' apps field: commas or new lines. */
export function parseApps(text) {
    return [...new Set(text.split(/[,\n]/).map(s => s.trim()).filter(s => s !== ''))];
}
