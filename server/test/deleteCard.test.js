'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Point the store at a throwaway data file BEFORE requiring it, so the
// real server/data/board.json is never touched by tests.
const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'orbit-')), 'board.json');
process.env.DATA_FILE = tmpFile;
const store = require('../src/store/dataStore');

function seed() {
  store.writeData([
    {
      id: 'board-1',
      title: 'Test board',
      columns: [
        {
          id: 'col-backlog',
          title: 'Backlog',
          cards: [
            { id: 'card-1', title: 'First', description: '' },
            { id: 'card-2', title: 'Second', description: '' },
          ],
        },
      ],
    },
  ]);
}

test('deleteCard removes only the requested card and returns { ok: true }', () => {
  seed();
  const result = store.deleteCard('board-1', 'col-backlog', 'card-1');
  assert.deepStrictEqual(result, { ok: true });
  const ids = store.getBoard('board-1').columns[0].cards.map((c) => c.id);
  assert.deepStrictEqual(ids, ['card-2']);
});

test('deleteCard throws a 404 (not a TypeError) for an unknown card', () => {
  seed();
  assert.throws(
    () => store.deleteCard('board-1', 'col-backlog', 'does-not-exist'),
    (err) => err.status === 404 && /Card not found/.test(err.message)
  );
});
