import assert from 'node:assert/strict';
import {test} from 'node:test';

import {alertArgs, candidates, parseApps, wanted} from '../keybars@keybars.app/lib.js';

test('apps are matched by name or ID, any case', () => {
    assert.ok(wanted(['Slack'], false, 'Slack', 'com.slack.Slack'));
    assert.ok(wanted(['com.slack.Slack.desktop'], false, 'Slack', 'com.slack.Slack'));
    assert.ok(wanted([' slack '], false, 'Slack', undefined));
    assert.ok(!wanted(['Slack'], false, 'Mail', 'org.gnome.Evolution'));
    assert.ok(!wanted([''], false, '', undefined));
    assert.ok(!wanted([], false, 'Slack', undefined));
    assert.ok(wanted([], true, 'Anything', undefined));
});

test('a notification is desktop.notification, the app its repository', () => {
    assert.deepEqual(alertArgs('Slack'), ['alert', '-q', '-repo', 'Slack', 'desktop.notification']);
    assert.deepEqual(alertArgs(''), ['alert', '-q', 'desktop.notification']);
});

test('keybars-pro is looked for where keybars Pro installs it', () => {
    assert.deepEqual(candidates('', '/home/me'), [
        '/usr/bin/keybars-pro',
        '/usr/local/bin/keybars-pro',
        '/home/me/.local/bin/keybars-pro',
    ]);
    assert.equal(candidates(' ~/bin/kp ', '/home/me')[0], '/home/me/bin/kp');
});

test('the apps field splits on commas and lines', () => {
    assert.deepEqual(parseApps('Slack, Mail\n com.slack.Slack ,,Slack'), ['Slack', 'Mail', 'com.slack.Slack']);
    assert.deepEqual(parseApps(''), []);
});
