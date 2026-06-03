import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('translation files have aligned keys', async () => {
  const { translations } = await import('../src/i18n/translations.js');
  const { es, en } = translations;

  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
});

test('static pages include core game actions', async () => {
  const shell = await readFile('index.html', 'utf8');
  const script = await readFile('src/scripts/cherryGame.js', 'utf8');

  assert.match(shell, /data-action="show-difficulty"/);
  assert.match(shell, /data-action="share"/);
  assert.match(shell, /data-action="open-menu"/);
  assert.match(shell, /data-dialog="pause"/);
  assert.match(shell, /data-final="best"/);
  assert.match(script, /button\.dataset\.action = 'start'/);
  assert.match(shell, /data-assets-base="assets\/sprites\/cherries\/"/);
});

test('game data includes progressive difficulty and bad cherry variants', async () => {
  const data = await readFile('src/data/game.js', 'utf8');

  assert.match(data, /badLimit: 7/);
  assert.match(data, /badLimit: 3/);
  assert.match(data, /rotten/);
  assert.match(data, /worm/);
  assert.match(data, /cracked/);
});

test('sprite pipeline assets exist in public folder', async () => {
  const meta = JSON.parse(await readFile('assets/sprites/cherries/pipeline-meta.json', 'utf8'));

  assert.equal(meta.rows, 2);
  assert.equal(meta.cols, 2);
  assert.deepEqual(meta.frames, ['healthy', 'rotten', 'worm', 'cracked']);
});

test('game conveyor moves cherries vertically', async () => {
  const script = await readFile('src/scripts/cherryGame.js', 'utf8');

  assert.match(script, /y: -70/);
  assert.match(script, /cherry\.y \+= \(cherry\.removed \? speed \* 0\.35 : speed\)/);
  assert.match(script, /swipeX/);
});

test('mobile play view gives the conveyor full available height', async () => {
  const css = await readFile('src/styles/global.css', 'utf8');
  const script = await readFile('src/scripts/cherryGame.js', 'utf8');

  assert.match(css, /height: calc\(100dvh - 1rem\)/);
  assert.match(css, /aspect-ratio: auto/);
  assert.match(css, /width: 4\.9rem/);
  assert.match(css, /body:has\(\[data-current-screen="play"\]\) \.nav-links/);
  assert.match(script, /new ResizeObserver\(resizeCanvas\)/);
  assert.match(script, /context\.fillRect\(belt\.left, 0, belt\.width, canvas\.height\)/);
});

test('hamburger menu pauses and end screen tracks records', async () => {
  const script = await readFile('src/scripts/cherryGame.js', 'utf8');

  assert.match(script, /const openPauseMenu = \(\) =>/);
  assert.match(script, /setPaused\(true\)/);
  assert.match(script, /const exitGame = \(\) =>/);
  assert.match(script, /localStorage\.setItem\(bestKey\(\), String\(bestScore\)\)/);
});
