import { cherrySpriteSheet, cherrySprites, difficultyOptions } from '../data/game.js?v=4';
import { getLocale, t } from '../i18n/translations.js?v=4';

const setupCherryGame = (root) => {
  const canvas = root.querySelector('[data-canvas]');
  const context = canvas.getContext('2d');
  const screens = [...root.querySelectorAll('[data-screen]')];
  const locale = getLocale();
  const labels = {
    pause: t(locale, 'game.pause'),
    resume: t(locale, 'game.resume'),
    shareText: t(locale, 'game.shareText'),
    shareCopied: t(locale, 'game.shareCopied'),
    shareFallback: t(locale, 'game.shareFallback'),
    ready: t(locale, 'game.ready'),
    allowed: t(locale, 'game.allowed'),
    newRecord: t(locale, 'game.newRecord'),
    keepTrying: t(locale, 'game.keepTrying'),
  };
  const difficulties = difficultyOptions;
  const sprites = cherrySprites;
  const goodSprites = sprites.filter((sprite) => sprite.kind === 'good');
  const badSprites = sprites.filter((sprite) => sprite.kind === 'bad');
  const stats = {
    time: root.querySelector('[data-stat="time"]'),
    score: root.querySelector('[data-stat="score"]'),
    missed: root.querySelector('[data-stat="missed"]'),
    limit: root.querySelector('[data-stat="limit"]'),
  };
  const finals = {
    time: root.querySelector('[data-final="time"]'),
    score: root.querySelector('[data-final="score"]'),
    best: root.querySelector('[data-final="best"]'),
    message: root.querySelector('[data-final="message"]'),
  };
  const dialogs = {
    about: root.querySelector('[data-dialog="about"]'),
    pause: root.querySelector('[data-dialog="pause"]'),
    over: root.querySelector('[data-dialog="over"]'),
  };
  const toast = root.querySelector('[data-toast]');
  const sheet = new Image();
  const state = {
    active: false,
    paused: false,
    difficulty: difficulties[0],
    cherries: [],
    effects: [],
    pointers: new Map(),
    lastTime: 0,
    elapsed: 0,
    score: 0,
    missed: 0,
    spawnTimer: 0,
    sheetReady: false,
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getBelt = () => {
    const width = clamp(canvas.width * 0.34, 170, 280);
    const left = (canvas.width - width) / 2;
    return {
      left,
      width,
      right: left + width,
      center: canvas.width / 2,
    };
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width), 320);
    const height = Math.max(Math.round(rect.height), 360);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      drawBelt(state.elapsed);
    }
  };

  const localizePage = () => {
    document.documentElement.lang = locale;
    document.title = t(locale, 'site.title');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const mobileKey = element.dataset.i18nMobile;
      element.textContent = mobileKey && matchMedia('(max-width: 42rem)').matches
        ? t(locale, mobileKey)
        : t(locale, element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const [attribute, key] = element.dataset.i18nAttr.split(':');
      element.setAttribute(attribute, t(locale, key));
    });
  };

  const buildDifficultyButtons = () => {
    const grid = root.querySelector('[data-difficulty-grid]');
    grid.innerHTML = '';
    difficulties.forEach((option) => {
      const button = document.createElement('button');
      const label = document.createTextNode(t(locale, `game.${option.id}`));
      const limit = document.createElement('span');
      button.type = 'button';
      button.dataset.action = 'start';
      button.dataset.difficulty = option.id;
      limit.textContent = `${labels.allowed}: ${option.badLimit}`;
      button.append(label, limit);
      grid.append(button);
    });
  };

  const showScreen = (name) => {
    root.dataset.currentScreen = name;
    screens.forEach((screen) => screen.classList.toggle('is-hidden', screen.dataset.screen !== name));
    if (name === 'play') window.requestAnimationFrame(resizeCanvas);
  };

  const closeDialog = (dialog) => {
    if (dialog?.open) dialog.close();
  };

  const bestKey = () => `cerezas:best:${state.difficulty.id}`;

  const getBestScore = () => Number(localStorage.getItem(bestKey()) ?? 0);

  const setPaused = (paused) => {
    state.paused = paused;
  };

  const openPauseMenu = () => {
    if (!state.active || dialogs.over.open) return;
    setPaused(true);
    dialogs.pause.showModal();
  };

  const resumeGame = () => {
    closeDialog(dialogs.pause);
    setPaused(false);
    state.lastTime = performance.now();
  };

  const exitGame = () => {
    state.active = false;
    setPaused(false);
    state.cherries = [];
    state.effects = [];
    Object.values(dialogs).forEach(closeDialog);
    showScreen('home');
    drawBelt(0);
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
  };

  const randomFrom = (items) => items[Math.floor(Math.random() * items.length)] ?? sprites[0];

  const chooseSprite = () => {
    const badChance = Math.min(0.32 + state.elapsed / 70000, 0.62);
    return Math.random() > badChance ? randomFrom(goodSprites) : randomFrom(badSprites);
  };

  const spawnCherry = () => {
    const sprite = chooseSprite();
    const belt = getBelt();
    state.cherries.push({
      id: crypto.randomUUID(),
      sprite,
      x: belt.center + (Math.random() - 0.5) * belt.width * 0.44,
      y: -70,
      size: clamp(canvas.width * 0.12, 58, 88) + Math.random() * 8,
      wobble: Math.random() * Math.PI * 2,
      removed: false,
      vx: 0,
      vy: 0,
      spin: 0,
    });
  };

  const resetGame = (difficultyId = state.difficulty.id) => {
    state.difficulty = difficulties.find((option) => option.id === difficultyId) ?? difficulties[0];
    state.active = true;
    state.paused = false;
    state.cherries = [];
    state.effects = [];
    state.elapsed = 0;
    state.score = 0;
    state.missed = 0;
    state.spawnTimer = 0;
    state.lastTime = performance.now();
    stats.limit.textContent = state.difficulty.badLimit;
    Object.values(dialogs).forEach(closeDialog);
    showScreen('play');
    requestAnimationFrame(loop);
  };

  const endGame = () => {
    const finalScore = Math.floor(state.score);
    const previousBest = getBestScore();
    const bestScore = Math.max(previousBest, finalScore);
    if (bestScore > previousBest) localStorage.setItem(bestKey(), String(bestScore));
    state.active = false;
    setPaused(false);
    closeDialog(dialogs.pause);
    finals.score.textContent = String(finalScore);
    finals.time.textContent = String(Math.floor(state.elapsed / 1000));
    finals.best.textContent = String(bestScore);
    finals.message.textContent = finalScore > previousBest ? labels.newRecord : labels.keepTrying;
    dialogs.over.showModal();
  };

  const addEffect = (x, y, text, color) => {
    state.effects.push({ x, y, text, color, life: 720 });
  };

  const discardCherry = (cherry, direction) => {
    if (cherry.removed) return;
    cherry.removed = true;
    cherry.vx = direction * 760;
    cherry.spin = direction * 7;
    if (cherry.sprite.kind === 'bad') {
      state.score += 80 + Math.floor(state.elapsed / 1000) * 2;
      addEffect(cherry.x, cherry.y, '+80', '#127c68');
    } else {
      state.score = Math.max(0, state.score - 120);
      addEffect(cherry.x, cherry.y, '-120', '#a7163e');
    }
  };

  const findCherry = (x, y) => {
    for (let index = state.cherries.length - 1; index >= 0; index -= 1) {
      const cherry = state.cherries[index];
      const radius = cherry.size * 0.55;
      if (Math.hypot(cherry.x - x, cherry.y - y) < radius) return cherry;
    }
    return null;
  };

  const pointerPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const drawBelt = (time) => {
    const belt = getBelt();
    const inset = Math.max(16, belt.width * 0.08);
    const slatWidth = belt.width - inset * 2;
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-belt');
    context.fillRect(belt.left, 0, belt.width, canvas.height);
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-belt-line');
    for (let y = ((time / 12) % 68) - 68; y < canvas.height + 80; y += 68) {
      context.fillRect(belt.left + inset, y, slatWidth, 26);
    }
    context.fillStyle = 'rgb(255 255 255 / 0.18)';
    context.fillRect(belt.left, 0, Math.max(14, belt.width * 0.08), canvas.height);
    context.fillStyle = 'rgb(0 0 0 / 0.16)';
    context.fillRect(belt.right - Math.max(14, belt.width * 0.08), 0, Math.max(14, belt.width * 0.08), canvas.height);
  };

  const drawCherry = (cherry) => {
    const cellWidth = sheet.width / cherrySpriteSheet.columns;
    const cellHeight = sheet.height / cherrySpriteSheet.rows;
    const sourceX = cherry.sprite.column * cellWidth;
    const sourceY = cherry.sprite.row * cellHeight;
    const bob = Math.sin(state.elapsed / 160 + cherry.wobble) * 4;
    context.save();
    context.translate(cherry.x + bob, cherry.y);
    context.rotate(cherry.spin * 0.05);
    context.drawImage(sheet, sourceX, sourceY, cellWidth, cellHeight, -cherry.size / 2, -cherry.size / 2, cherry.size, cherry.size);
    context.restore();
  };

  const drawEffects = (delta) => {
    state.effects = state.effects.filter((effect) => {
      effect.life -= delta;
      effect.y -= delta * 0.035;
      context.globalAlpha = Math.max(effect.life / 720, 0);
      context.fillStyle = effect.color;
      context.font = '700 28px system-ui';
      context.fillText(effect.text, effect.x, effect.y);
      context.globalAlpha = 1;
      return effect.life > 0;
    });
  };

  const updateCherries = (delta) => {
    const pace = state.difficulty.speed + state.elapsed / 52000;
    const speed = 150 * pace;
    state.spawnTimer -= delta;
    if (state.spawnTimer <= 0) {
      spawnCherry();
      state.spawnTimer = Math.max(330, state.difficulty.spawn - state.elapsed / 28);
    }
    state.cherries.forEach((cherry) => {
      cherry.x += cherry.vx * (delta / 1000);
      cherry.y += (cherry.removed ? speed * 0.35 : speed) * (delta / 1000);
      cherry.spin += delta / 180;
    });
    state.cherries = state.cherries.filter((cherry) => {
      const gone = cherry.y > canvas.height + 100 || cherry.x < -120 || cherry.x > canvas.width + 120;
      if (gone && !cherry.removed && cherry.sprite.kind === 'bad') {
        state.missed += 1;
        addEffect(cherry.x, canvas.height - 80, '!', '#a7163e');
      }
      return !gone;
    });
  };

  const updateStats = () => {
    state.score += 0.018;
    stats.time.textContent = String(Math.floor(state.elapsed / 1000));
    stats.score.textContent = String(Math.floor(state.score));
    stats.missed.textContent = String(state.missed);
    if (state.missed >= state.difficulty.badLimit) endGame();
  };

  const loop = (time) => {
    if (!state.active) return;
    const delta = Math.min(time - state.lastTime, 40);
    state.lastTime = time;
    if (!state.paused) {
      state.elapsed += delta;
      drawBelt(state.elapsed);
      updateCherries(delta);
      state.cherries.forEach(drawCherry);
      drawEffects(delta);
      updateStats();
    }
    requestAnimationFrame(loop);
  };

  canvas.addEventListener('pointerdown', (event) => {
    const point = pointerPosition(event);
    state.pointers.set(event.pointerId, { ...point, cherry: findCherry(point.x, point.y) });
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointerup', (event) => {
    const start = state.pointers.get(event.pointerId);
    const end = pointerPosition(event);
    state.pointers.delete(event.pointerId);
    if (!start?.cherry) return;
    const swipeX = end.x - start.x;
    const direction = swipeX < 0 ? -1 : 1;
    if (Math.abs(swipeX) > 22 || Math.hypot(swipeX, end.y - start.y) < 16) {
      discardCherry(start.cherry, direction);
    }
  });

  root.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'show-difficulty') showScreen('difficulty');
    if (action === 'show-about') dialogs.about.showModal();
    if (action === 'home') showScreen('home');
    if (action === 'start') resetGame(button.dataset.difficulty);
    if (action === 'open-menu') openPauseMenu();
    if (action === 'resume') resumeGame();
    if (action === 'exit') exitGame();
    if (action === 'restart') {
      closeDialog(dialogs.over);
      closeDialog(dialogs.pause);
      resetGame();
    }
    if (action === 'close-dialog') button.closest('dialog')?.close();
    if (action === 'share') {
      const shareData = { title: labels.ready, text: labels.shareText, url: location.href };
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard?.writeText(location.href);
        showToast(navigator.clipboard ? labels.shareCopied : labels.shareFallback);
      }
    }
  });

  sheet.onload = () => {
    state.sheetReady = true;
    resizeCanvas();
    drawBelt(0);
  };
  sheet.src = `${root.dataset.assetsBase}sheet-transparent.png`;
  localizePage();
  buildDifficultyButtons();
  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(canvas);
};

document.querySelectorAll('[data-game]').forEach(setupCherryGame);
