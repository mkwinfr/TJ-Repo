import React, { useCallback, useEffect, useRef, useState } from 'react';

const GAME_W = 390;
const GAME_H = 720;
const SAVE_KEY = 'balloon-pop-save';

const WORLDS = [
  {
    idx: 0,
    name: 'Cloud Meadows',
    unlockStars: 0,
    palette: { top: '#87ceeb', mid: '#b8e3f5', bot: '#e8f6ff' },
    deco: 'clouds',
    intro:
      'Welcome, Sky Knight. The balloons of the kingdom have scattered to the winds. Reclaim them, starting here in the gentle meadows above the clouds.',
  },
  {
    idx: 1,
    name: 'Sunrise Peaks',
    unlockStars: 20,
    palette: { top: '#ff9e6d', mid: '#ffc48a', bot: '#fff0cf' },
    deco: 'sunrise',
    intro:
      'The dawn winds are fierce here. Beware bombs drifting between the ridges and red streaking fast balloons racing toward the sky.',
  },
  {
    idx: 2,
    name: 'Storm Cliffs',
    unlockStars: 50,
    palette: { top: '#4a4e7c', mid: '#7d6b9e', bot: '#b3a4c9' },
    deco: 'storm',
    intro:
      'Thunder crowns the cliffs. Golden balloons now appear amid lightning squalls. Keep your focus when the sky flashes.',
  },
  {
    idx: 3,
    name: 'Crystal Spires',
    unlockStars: 85,
    palette: { top: '#00b3a4', mid: '#6fd6c7', bot: '#c8f2ec' },
    deco: 'crystals',
    intro:
      'Crystal towers sing in the wind. Rainbow balloons and armored brutes join the swarm. Strike true and strike fast.',
  },
  {
    idx: 4,
    name: 'Frost Kingdom',
    unlockStars: 130,
    palette: { top: '#6ea5d9', mid: '#a8cce8', bot: '#e0f0fa' },
    deco: 'snow',
    intro:
      'Icy currents bite at your hands. Frozen balloons can slow time itself. Use the calm they grant before the blizzard returns.',
  },
  {
    idx: 5,
    name: 'Celestial Gardens',
    unlockStars: 180,
    palette: { top: '#1a0b3d', mid: '#4a2e7a', bot: '#7b4da3' },
    deco: 'stars',
    intro:
      'Moonlit orchards bloom above the clouds. Multiplier balloons pulse among the starlight. Harvest massive scores under the constellations.',
  },
  {
    idx: 6,
    name: 'Sky Citadel',
    unlockStars: 240,
    palette: { top: '#3a1a6b', mid: '#8b4f9b', bot: '#ffd9a8' },
    deco: 'citadel',
    intro:
      'You have reached the royal citadel. Every balloon form gathers here in one final storm. Defend the kingdom and claim the crown.',
  },
];

const NORMAL_COLORS = [
  { id: 'red', name: 'Red', color: '#FF6B6B' },
  { id: 'yellow', name: 'Yellow', color: '#FFD93D' },
  { id: 'green', name: 'Green', color: '#6BCB77' },
  { id: 'blue', name: 'Blue', color: '#4D96FF' },
  { id: 'pink', name: 'Pink', color: '#FF6FC8' },
  { id: 'purple', name: 'Purple', color: '#A855F7' },
  { id: 'tangerine', name: 'Tangerine', color: '#FF9F43' },
  { id: 'teal', name: 'Teal', color: '#00D9C0' },
  { id: 'rose', name: 'Rose', color: '#F06292' },
  { id: 'cyan', name: 'Sky Cyan', color: '#00BFFF' },
  { id: 'lime', name: 'Lime', color: '#C2F970' },
  { id: 'bubblegum', name: 'Bubblegum', color: '#FFB5E8' },
  { id: 'mint', name: 'Mint', color: '#B5EAD7' },
  { id: 'peach', name: 'Peach', color: '#FFDAC1' },
  { id: 'lavender', name: 'Lavender', color: '#C7CEEA' },
  { id: 'cream', name: 'Cream', color: '#FFFFF0' },
  { id: 'crimson-neon', name: 'Crimson Neon', color: '#FF5E5E' },
  { id: 'neon-green', name: 'Neon Green', color: '#39FF14' },
  { id: 'striped-red', name: 'Striped Red', color: '#FF6B6B', pattern: 'striped-red' },
  { id: 'striped-blue', name: 'Striped Blue', color: '#4D96FF', pattern: 'striped-blue' },
  { id: 'dotted-yellow', name: 'Dotted Yellow', color: '#FFD93D', pattern: 'dotted-yellow' },
  { id: 'dotted-pink', name: 'Dotted Pink', color: '#FF6FC8', pattern: 'dotted-pink' },
  { id: 'iridescent', name: 'Iridescent', color: '#FF6FC8', pattern: 'iridescent' },
  { id: 'pastel', name: 'Pastel', color: '#F8C8DC', pattern: 'pastel' },
];

const BALLOON_TYPES = {
  ...NORMAL_COLORS.reduce((acc, c) => {
    acc[`normal-${c.id}`] = {
      key: `normal-${c.id}`,
      kind: 'normal',
      points: 1,
      color: c.color,
      pattern: c.pattern || null,
      label: c.name,
    };
    return acc;
  }, {}),
  bomb: {
    key: 'bomb',
    kind: 'bomb',
    points: 0,
    color: '#1a1a2e',
    label: 'Bomb',
    icon: '💣',
  },
  golden: {
    key: 'golden',
    kind: 'golden',
    points: 5,
    color: '#FFD700',
    label: 'Golden',
    icon: '✨',
  },
  rainbow: {
    key: 'rainbow',
    kind: 'rainbow',
    points: 2,
    color: '#e879f9',
    label: 'Rainbow',
    icon: '🌈',
  },
  frozen: {
    key: 'frozen',
    kind: 'frozen',
    points: 2,
    color: '#b3e5fc',
    label: 'Frozen',
    icon: '❄',
  },
  multiplier: {
    key: 'multiplier',
    kind: 'multiplier',
    points: 2,
    color: '#e040fb',
    label: 'Multiplier',
    text: '2x',
  },
  fast: {
    key: 'fast',
    kind: 'fast',
    points: 3,
    color: '#FF3B3B',
    label: 'Fast',
    icon: '⚡',
  },
  armored: {
    key: 'armored',
    kind: 'armored',
    points: 0,
    color: '#6b7280',
    label: 'Armored',
  },
  powerupLightning: {
    key: 'powerupLightning',
    kind: 'powerupLightning',
    points: 0,
    color: '#fef08a',
    label: 'Lightning',
    icon: '⚡',
  },
  powerupBigbang: {
    key: 'powerupBigbang',
    kind: 'powerupBigbang',
    points: 0,
    color: '#ff5722',
    label: 'Big Bang',
    icon: '💥',
  },
  powerupMagnet: {
    key: 'powerupMagnet',
    kind: 'powerupMagnet',
    points: 0,
    color: '#9333ea',
    label: 'Magnet',
    icon: '🧲',
  },
  powerupShield: {
    key: 'powerupShield',
    kind: 'powerupShield',
    points: 0,
    color: '#06b6d4',
    label: 'Shield',
    icon: '🛡',
  },
  powerupExplosiveChain: {
    key: 'powerupExplosiveChain',
    kind: 'powerupExplosiveChain',
    points: 0,
    color: '#ff4444',
    label: 'Explosive Chain',
    icon: '🔥',
  },
  powerupBubbleWave: {
    key: 'powerupBubbleWave',
    kind: 'powerupBubbleWave',
    points: 0,
    color: '#0ea5e9',
    label: 'Bubble Wave',
    icon: '🌊',
  },
  powerupJackpot: {
    key: 'powerupJackpot',
    kind: 'powerupJackpot',
    points: 0,
    color: '#a78bfa',
    label: 'Jackpot',
    icon: '💎',
  },
  powerupPrecisionFocus: {
    key: 'powerupPrecisionFocus',
    kind: 'powerupPrecisionFocus',
    points: 0,
    color: '#fbbf24',
    label: 'Precision Focus',
    icon: '🎯',
  },
  powerupTornado: {
    key: 'powerupTornado',
    kind: 'powerupTornado',
    points: 0,
    color: '#10b981',
    label: 'Tornado',
    icon: '🌪',
  },
  powerupLuckyDraw: {
    key: 'powerupLuckyDraw',
    kind: 'powerupLuckyDraw',
    points: 0,
    color: '#f59e0b',
    label: 'Lucky Draw',
    icon: '💰',
  },
  powerupOverdrive: {
    key: 'powerupOverdrive',
    kind: 'powerupOverdrive',
    points: 0,
    color: '#ec4899',
    label: 'Overdrive',
    icon: '⚡',
  },
  powerupReflectShield: {
    key: 'powerupReflectShield',
    kind: 'powerupReflectShield',
    points: 0,
    color: '#8b5cf6',
    label: 'Reflect Shield',
    icon: '🛡',
  },
  powerupComboBooster: {
    key: 'powerupComboBooster',
    kind: 'powerupComboBooster',
    points: 0,
    color: '#06f6d4',
    label: 'Combo Booster',
    icon: '🌟',
  },
  powerupHomingBalloons: {
    key: 'powerupHomingBalloons',
    kind: 'powerupHomingBalloons',
    points: 0,
    color: '#fbbf24',
    label: 'Homing Balloons',
    icon: '📍',
  },
  heartBalloon: {
    key: 'heartBalloon',
    kind: 'normal',
    points: 2,
    color: '#ff4d9e',
    label: 'Heart',
  },
  unicornBalloon: {
    key: 'unicornBalloon',
    kind: 'normal',
    points: 3,
    color: '#c084fc',
    label: 'Unicorn',
  },
  rainbowShapeBalloon: {
    key: 'rainbowShapeBalloon',
    kind: 'normal',
    points: 2,
    color: '#60a5fa',
    label: 'Rainbow',
  },
};

const LEVEL_ROTATION = [
  'ScoreAttack',
  'ScoreAttack',
  'Precision',
  'ScoreAttack',
  'Chain',
  'ScoreAttack',
  'Precision',
  'Survival',
  'ScoreAttack',
  'Chain',
  'ScoreAttack',
  'Precision',
  'Survival',
  'ScoreAttack',
  'Boss',
];

function rand(a, b) {
  return Math.random() * (b - a) + a;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function haptic(kind, enabled = true) {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }
  if (kind === 'pop') navigator.vibrate(8);
  if (kind === 'combo') navigator.vibrate(18);
  if (kind === 'bomb') navigator.vibrate([40, 20, 60]);
  if (kind === 'star') navigator.vibrate([30, 40, 30, 40, 60]);
  if (kind === 'button') navigator.vibrate(5);
}

// ── Web Audio ────────────────────────────────────────────────────────────────
let _audioCtx = null;
let _ambientNodes = null;

function getAudioCtx() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      return null;
    }
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {});
  return _audioCtx;
}

function playSound(kind, enabled = true) {
  if (!enabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;

  const note = (type, freq, vol, dur, at = t) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.start(at);
    o.stop(at + dur + 0.01);
  };

  switch (kind) {
    case 'pop': {
      const variant = Math.floor(Math.random() * 4);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      if (variant === 0) {
        // Standard pop
        const pitch = 420 + Math.random() * 200;
        o.type = 'sine';
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.28, t + 0.11);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        o.start(t);
        o.stop(t + 0.13);
      } else if (variant === 1) {
        // Higher, snappier pop
        const pitch = 600 + Math.random() * 180;
        o.type = 'sine';
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.18, t + 0.08);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.start(t);
        o.stop(t + 0.10);
      } else if (variant === 2) {
        // Warmer lower pop
        const pitch = 260 + Math.random() * 80;
        o.type = 'triangle';
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.35, t + 0.14);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.start(t);
        o.stop(t + 0.16);
      } else {
        // Bright click pop
        const pitch = 720 + Math.random() * 280;
        o.type = 'square';
        o.frequency.setValueAtTime(pitch, t);
        o.frequency.exponentialRampToValueAtTime(pitch * 0.12, t + 0.07);
        g.gain.setValueAtTime(0.09, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        o.start(t);
        o.stop(t + 0.09);
      }
      break;
    }
    case 'pop-heart': {
      // Soft, pitched-up chime for heart balloons
      note('sine', 880 + Math.random() * 160, 0.11, 0.18);
      note('sine', 1100, 0.07, 0.14, t + 0.04);
      break;
    }
    case 'pop-unicorn': {
      // Magical sparkle arpeggio
      [880, 1100, 1320].forEach((f, i) => note('sine', f, 0.09, 0.14, t + i * 0.045));
      break;
    }
    case 'pop-rainbow': {
      // Short rising sweep
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.connect(g2);
      g2.connect(ctx.destination);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(320, t);
      o2.frequency.exponentialRampToValueAtTime(960, t + 0.18);
      g2.gain.setValueAtTime(0.12, t);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);
      o2.start(t);
      o2.stop(t + 0.21);
      break;
    }
    case 'golden':
      note('sine', 1046, 0.18, 0.22);
      note('sine', 1318, 0.12, 0.18, t + 0.05);
      break;
    case 'bomb': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(28, t + 0.38);
      g.gain.setValueAtTime(0.28, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.start(t);
      o.stop(t + 0.43);
      break;
    }
    case 'combo':
      [523, 659, 784].forEach((f, i) => note('sine', f, 0.13, 0.20, t + i * 0.075));
      break;
    case 'powerup':
      [440, 660, 880, 1320].forEach((f, i) => note('sine', f, 0.13, 0.20, t + i * 0.06));
      break;
    case 'rainbow': {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(320, t);
      o.frequency.exponentialRampToValueAtTime(1760, t + 0.38);
      g.gain.setValueAtTime(0.17, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.start(t);
      o.stop(t + 0.43);
      break;
    }
    case 'star':
      [523, 659, 784].forEach((f, i) => note('sine', f, 0.18, 0.30, t + i * 0.14));
      break;
    default:
      break;
  }
}

function stopAmbient() {
  if (!_ambientNodes) return;
  try {
    _ambientNodes.forEach((n) => {
      if (n?.stop) n.stop();
      if (n?.disconnect) n.disconnect();
    });
  } catch {
    // no-op
  }
  _ambientNodes = null;
}

function startAmbient(worldIdx, enabled = true) {
  stopAmbient();
  if (!enabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  const base = 90 + worldIdx * 18;
  const bed = ctx.createOscillator();
  const tone = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const bedGain = ctx.createGain();
  const toneGain = ctx.createGain();
  const lfoGain = ctx.createGain();
  const master = ctx.createGain();

  bed.type = 'triangle';
  tone.type = worldIdx >= 4 ? 'sine' : 'triangle';
  lfo.type = 'sine';

  bed.frequency.setValueAtTime(base, ctx.currentTime);
  tone.frequency.setValueAtTime(base * (worldIdx >= 4 ? 2.02 : 1.5), ctx.currentTime);
  lfo.frequency.setValueAtTime(0.07 + worldIdx * 0.01, ctx.currentTime);

  bedGain.gain.setValueAtTime(0.010, ctx.currentTime);
  toneGain.gain.setValueAtTime(0.006, ctx.currentTime);
  lfoGain.gain.setValueAtTime(6, ctx.currentTime);
  master.gain.setValueAtTime(0.65, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(tone.frequency);

  bed.connect(bedGain);
  tone.connect(toneGain);
  bedGain.connect(master);
  toneGain.connect(master);
  master.connect(ctx.destination);

  bed.start();
  tone.start();
  lfo.start();

  _ambientNodes = [bed, tone, lfo, bedGain, toneGain, lfoGain, master];
}

function pickBalloonType(level, mode = 'campaign', elapsedSeconds = 0) {
  const worldIdx = level?.worldIdx ?? 0;

  // Power-ups available from world 0 at a lower rate; chance scales up with world
  const powerupChance = worldIdx === 0 ? 0.022 : 0.042;
  if (Math.random() < powerupChance) {
    // Shield and Magnet feel too powerful in very early worlds — gate those two
    const p = worldIdx === 0
      ? ['powerupLightning', 'powerupBigbang']
      : ['powerupLightning', 'powerupBigbang', 'powerupMagnet', 'powerupShield', 'powerupExplosiveChain', 'powerupBubbleWave', 'powerupJackpot', 'powerupPrecisionFocus', 'powerupTornado', 'powerupLuckyDraw', 'powerupOverdrive', 'powerupReflectShield', 'powerupComboBooster', 'powerupHomingBalloons'];
    return p[Math.floor(Math.random() * p.length)];
  }

  const weights = [];
  const add = (key, w) => weights.push({ key, w });

  NORMAL_COLORS.forEach((c) => add(`normal-${c.id}`, mode === 'survival' ? 1 : 1.35));

  // Decorative shape balloons — available from the start
  add('heartBalloon', 0.28);
  add('unicornBalloon', 0.22);
  add('rainbowShapeBalloon', 0.22);

  if (worldIdx >= 1) {
    // Bomb weight scales from 0.11 at world 1 up to 0.26 at world 6
    const bombW = mode === 'zen' ? 0.06 : 0.11 + (worldIdx - 1) * 0.030;
    add('bomb', bombW);
    add('fast', 0.42);
  }
  if (worldIdx >= 2) add('golden', 0.26);
  if (worldIdx >= 3) {
    add('rainbow', 0.20);
    add('armored', 0.18 + level.levelIdx * 0.018);
  }
  if (worldIdx >= 4) add('frozen', 0.20);
  if (worldIdx >= 5) add('multiplier', 0.19);
  if (mode === 'survival') {
    add('fast', 0.18 + elapsedSeconds * 0.0018);
    add('bomb', 0.07 + elapsedSeconds * 0.0015);
  }

  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i].w;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    r -= weights[i].w;
    if (r <= 0) return weights[i].key;
  }
  return weights[0].key;
}

function survivalParams(seconds) {
  const phase = Math.floor(seconds / 15);
  const difficulty = 1 + phase * 0.38;
  return {
    speed: 2.1 + difficulty * 0.42,
    spawnMs: Math.max(120, 650 - difficulty * 68),
  };
}

function generateLevel(worldIdx, levelIdx) {
  const type = LEVEL_ROTATION[levelIdx % LEVEL_ROTATION.length];
  const difficulty = worldIdx * 0.48 + levelIdx * 0.055;
  const speed = 2.1 + difficulty * 1.25;
  const spawnMs = Math.max(140, 820 - difficulty * 185);
  const time = Math.floor(clamp(30 + worldIdx * 1.5 + levelIdx * 0.5, 28, 48));

  const typeGoalBoost =
    type === 'Precision' ? -3 : type === 'Chain' ? 3 : type === 'Survival' ? 6 : type === 'Boss' ? 10 : 0;
  const goal = Math.floor(24 + worldIdx * 4 + levelIdx * 2.2 + typeGoalBoost);
  // Star-2 threshold
  const star2Mult = 4.5 + worldIdx * 1.1;
  const star2 = Math.floor(goal * star2Mult + difficulty * 22 + (type === 'Boss' ? 70 : 0));
  const star3Score = Math.floor(star2 * 1.35 + (type === 'Boss' ? 120 : 32));

  let masteryLabel = 'Master this stage!';
  if (type === 'ScoreAttack' || type === 'Boss') masteryLabel = `Score ${star3Score}+ points`;
  if (type === 'Precision') masteryLabel = 'Maintain 95%+ tap accuracy';
  if (type === 'Survival') masteryLabel = 'Let zero balloons escape';
  if (type === 'Chain') masteryLabel = 'Reach a 10x combo streak';

  return {
    id: `${worldIdx}-${levelIdx}`,
    worldIdx,
    levelIdx,
    displayNum: levelIdx + 1,
    type,
    goal,
    time,
    speed,
    spawnMs,
    star2,
    star3Score,
    masteryLabel,
  };
}

const ALL_LEVELS = [];
for (let w = 0; w < 7; w += 1) {
  for (let l = 0; l < 15; l += 1) {
    ALL_LEVELS.push(generateLevel(w, l));
  }
}

const DEFAULT_SAVE = {
  starsByLevel: {},
  bestScoreByLevel: {},
  totalStars: 0,
  survivalBest: 0,
  survivalBestTime: 0,
  survivalRuns: 0,
  zenPops: 0,
  settings: {
    haptics: true,
    sound: true,
    ambient: true,
    reduceShake: false,
    reduceFlash: false,
    colorAssist: false,
    largeHud: false,
    batterySaver: false,
  },
  introsSeen: {},
  seenPowerups: {},
  unlockedBadges: {},
  royalTitle: 'Sky Squire',
  tutorialSeen: false,
  // New engagement fields
  totalPops: 0,
  bestCombo: 0,
  perfectLevels: 0,
  activeSkin: 'classic',
  dailyChallenges: null,
  dailyProgress: {},
  dailyDate: '',
};

const TITLE_TIERS = [
  { stars: 0, title: 'Sky Squire' },
  { stars: 20, title: 'Cloud Ranger' },
  { stars: 50, title: 'Storm Chaser' },
  { stars: 85, title: 'Crystal Warden' },
  { stars: 130, title: 'Frost Marshal' },
  { stars: 180, title: 'Celestial Knight' },
  { stars: 240, title: 'Crown Guardian' },
  { stars: 300, title: 'Sky Monarch' },
];

function getRoyalTitle(totalStars = 0) {
  let current = TITLE_TIERS[0].title;
  for (let i = 0; i < TITLE_TIERS.length; i += 1) {
    if (totalStars >= TITLE_TIERS[i].stars) current = TITLE_TIERS[i].title;
  }
  return current;
}

function getWorldThreat(worldIdx) {
  const bombChance = worldIdx >= 1 ? Math.round((0.09 + (worldIdx - 1) * 0.022) * 100) : 0;
  const fastChance = worldIdx >= 1 ? Math.round(18 + worldIdx * 4) : 6;
  const armorChance = worldIdx >= 3 ? Math.round(18 + worldIdx * 2) : 0;
  return {
    bomb: clamp(bombChance, 0, 26),
    fast: clamp(fastChance, 6, 42),
    armor: clamp(armorChance, 0, 35),
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
      starsByLevel: { ...(parsed.starsByLevel || {}) },
      bestScoreByLevel: { ...(parsed.bestScoreByLevel || {}) },
      introsSeen: { ...(parsed.introsSeen || {}) },
      seenPowerups: { ...(parsed.seenPowerups || {}) },
      unlockedBadges: { ...(parsed.unlockedBadges || {}) },
      royalTitle: parsed.royalTitle || getRoyalTitle(parsed.totalStars || 0),
      tutorialSeen: parsed.tutorialSeen ?? false,
      totalPops: parsed.totalPops || 0,
      bestCombo: parsed.bestCombo || 0,
      perfectLevels: parsed.perfectLevels || 0,
      activeSkin: parsed.activeSkin || 'classic',
      dailyChallenges: parsed.dailyChallenges || null,
      dailyProgress: { ...(parsed.dailyProgress || {}) },
      dailyDate: parsed.dailyDate || '',
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

function writeSave(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// Only re-render the SVG when visual (non-positional) properties change.
// Position is applied by the wrapper div, so we skip re-renders on x/y moves.
const BalloonSVG = React.memo(
function BalloonSVGInner({ balloon, popFx = false, stringSway = 0, colorAssist = false }) {
  const { type, w, h, hitFlash, hp, hpMax } = balloon;
  const meta = BALLOON_TYPES[type] || BALLOON_TYPES['normal-red'];
  const cx = w / 2;
  const radius = type === 'fast' ? Math.min(w * 0.34, h * 0.3) : Math.min(w * 0.38, h * 0.32);
  const cy = radius + 8;
  const topY = cy - radius;
  const bodyBottomY = cy + radius;
  const halfW = radius;
  const sway = clamp(stringSway, -22, 22);
  const knotY = bodyBottomY + 4;
  const stringStartY = knotY + 2;
  const stringEndY = h + 24;
  const stringPath = `M ${cx} ${stringStartY} C ${cx - sway * 0.35} ${stringStartY + 8}, ${cx - sway} ${stringStartY + 16}, ${cx - sway * 1.25} ${stringEndY}`;
  const streak = type === 'fast';
  const isSpecial = !type.startsWith('normal-');
  const isHeart = type === 'heartBalloon';
  const isUnicorn = type === 'unicornBalloon';
  const isRainbowShape = type === 'rainbowShapeBalloon';
  const heartPath = isHeart
    ? `M ${cx} ${cy + radius} C ${cx - radius * 0.1} ${cy + radius * 0.6}, ${cx - radius * 0.95} ${cy + radius * 0.4}, ${cx - radius * 0.9} ${cy - radius * 0.1} C ${cx - radius * 0.8} ${cy - radius * 0.5}, ${cx - radius * 0.45} ${cy - radius * 0.75}, ${cx} ${cy - radius * 0.4} C ${cx + radius * 0.45} ${cy - radius * 0.75}, ${cx + radius * 0.8} ${cy - radius * 0.5}, ${cx + radius * 0.9} ${cy - radius * 0.1} C ${cx + radius * 0.95} ${cy + radius * 0.4}, ${cx + radius * 0.1} ${cy + radius * 0.6}, ${cx} ${cy + radius} Z`
    : '';

  return (
    <svg width={w} height={h + 24} viewBox={`0 0 ${w} ${h + 24}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`body-${balloon.id}`} cx="28%" cy="22%" r="84%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.52" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>

        <linearGradient id={`sheen-${balloon.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`rim-${balloon.id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id={`rainbow-${balloon.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ff5db1" />
          <stop offset="50%" stopColor="#5ea9ff" />
          <stop offset="100%" stopColor="#a15bff" />
        </linearGradient>

        <linearGradient id={`pastel-${balloon.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd6e7" />
          <stop offset="100%" stopColor="#f5b7ff" />
        </linearGradient>

        <pattern id={`striped-red-${balloon.id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="10" height="10" fill="#ff6b6b" />
          <rect width="5" height="10" fill="#ffd0d0" opacity="0.8" />
        </pattern>

        <pattern id={`striped-blue-${balloon.id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="10" height="10" fill="#4D96FF" />
          <rect width="5" height="10" fill="#b9ddff" opacity="0.85" />
        </pattern>

        <pattern id={`dotted-yellow-${balloon.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#FFD93D" />
          <circle cx="4" cy="4" r="2" fill="#fff5bf" opacity="0.85" />
          <circle cx="10" cy="10" r="2" fill="#fff5bf" opacity="0.85" />
        </pattern>

        <pattern id={`dotted-pink-${balloon.id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#FF6FC8" />
          <circle cx="4" cy="4" r="2" fill="#ffd9f0" opacity="0.85" />
          <circle cx="10" cy="10" r="2" fill="#ffd9f0" opacity="0.85" />
        </pattern>

        <clipPath id={`clip-${balloon.id}`}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>

        <linearGradient id={`armored-${balloon.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        <linearGradient id={`fast-streak-${balloon.id}`} x1="1" x2="0" y1="0" y2="0">
          <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`unicorn-grad-${balloon.id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f5d0fe" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        <linearGradient id={`horn-${balloon.id}`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>

        <linearGradient id={`rainbow-full-${balloon.id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="20%" stopColor="#fbbf24" />
          <stop offset="40%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#60a5fa" />
          <stop offset="80%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>

        {isHeart && (
          <clipPath id={`heart-clip-${balloon.id}`}>
            <path d={heartPath} />
          </clipPath>
        )}
      </defs>

      {streak && (
        <g opacity="0.65">
          <path d={`M ${cx - 4} ${cy - 10} C 4 ${cy - 4}, -12 ${cy}, -24 ${cy + 2}`} stroke={`url(#fast-streak-${balloon.id})`} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d={`M ${cx - 8} ${cy + 2} C 0 ${cy + 6}, -14 ${cy + 10}, -26 ${cy + 13}`} stroke={`url(#fast-streak-${balloon.id})`} strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}

      {isHeart ? (
        <>
          <path
            d={heartPath}
            fill={meta.color}
            stroke={`url(#rim-${balloon.id})`}
            strokeWidth="2.2"
            style={{ filter: popFx ? 'brightness(1.45) saturate(1.1)' : hitFlash ? 'brightness(1.75)' : 'none' }}
          />
          <path d={heartPath} fill={`url(#body-${balloon.id})`} />
          <path d={heartPath} fill={`url(#sheen-${balloon.id})`} />
          <ellipse cx={cx - radius * 0.28} cy={cy - radius * 0.46} rx="3" ry="4.5" fill="rgba(255,255,255,0.88)" />
        </>
      ) : (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={
              isUnicorn
                ? `url(#unicorn-grad-${balloon.id})`
                : isRainbowShape
                  ? `url(#rainbow-full-${balloon.id})`
                  : type === 'rainbow'
                    ? `url(#rainbow-${balloon.id})`
                    : type === 'armored'
                      ? `url(#armored-${balloon.id})`
                      : type === 'pastel'
                        ? `url(#pastel-${balloon.id})`
                        : meta.color
            }
            stroke={`url(#rim-${balloon.id})`}
            strokeWidth="2.2"
            style={{ filter: popFx ? 'brightness(1.45) saturate(1.1)' : hitFlash ? 'brightness(1.75)' : 'none' }}
          />

          {colorAssist && isSpecial && (
            <circle
              cx={cx}
              cy={cy}
              r={radius + 2.5}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="2.4"
              strokeDasharray={type === 'bomb' ? '3 3' : '7 3'}
            />
          )}

          <circle cx={cx} cy={cy} r={radius} fill={`url(#body-${balloon.id})`} clipPath={`url(#clip-${balloon.id})`} />
          <circle cx={cx} cy={cy} r={radius} fill={`url(#sheen-${balloon.id})`} clipPath={`url(#clip-${balloon.id})`} />

          {meta.pattern && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={
                meta.pattern === 'striped-red'
                  ? `url(#striped-red-${balloon.id})`
                  : meta.pattern === 'striped-blue'
                    ? `url(#striped-blue-${balloon.id})`
                    : meta.pattern === 'dotted-yellow'
                      ? `url(#dotted-yellow-${balloon.id})`
                      : meta.pattern === 'dotted-pink'
                        ? `url(#dotted-pink-${balloon.id})`
                        : meta.pattern === 'iridescent'
                          ? `url(#rainbow-${balloon.id})`
                          : `url(#pastel-${balloon.id})`
              }
              clipPath={`url(#clip-${balloon.id})`}
            />
          )}

          {type === 'armored' && (
            <g opacity="0.9">
              <path d={`M ${cx - 18} ${cy - 18} L ${cx + 18} ${cy - 18}`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              <path d={`M ${cx - 24} ${cy - 6} L ${cx + 24} ${cy - 6}`} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <path d={`M ${cx - 18} ${cy + 6} L ${cx + 18} ${cy + 6}`} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            </g>
          )}

          {/* Curved reflective band for glossy latex feel */}
          <path
            d={`M ${cx - halfW * 0.7} ${topY + 24} C ${cx - halfW * 0.2} ${topY + 10}, ${cx + halfW * 0.32} ${topY + 20}, ${cx + halfW * 0.7} ${topY + 34} C ${cx + halfW * 0.28} ${topY + 24}, ${cx - halfW * 0.18} ${topY + 20}, ${cx - halfW * 0.7} ${topY + 24} Z`}
            fill="rgba(255,255,255,0.2)"
            clipPath={`url(#clip-${balloon.id})`}
          />

          <path
            d={`M ${cx - halfW * 0.34} ${topY + 14} C ${cx - halfW * 0.18} ${topY + 7}, ${cx - halfW * 0.04} ${topY + 16}, ${cx - halfW * 0.16} ${topY + 29} C ${cx - halfW * 0.3} ${topY + 22}, ${cx - halfW * 0.44} ${topY + 24}, ${cx - halfW * 0.34} ${topY + 14} Z`}
            fill="rgba(255,255,255,0.65)"
          />
          <ellipse cx={cx - halfW * 0.28} cy={topY + 14} rx="3.4" ry="5.2" fill="rgba(255,255,255,0.9)" />

          {/* Rainbow arcs decoration */}
          {isRainbowShape && (
            <g clipPath={`url(#clip-${balloon.id})`} opacity="0.78">
              {[
                { ar: radius * 0.58, color: '#f87171', w: 3.5 },
                { ar: radius * 0.44, color: '#4ade80', w: 3.5 },
                { ar: radius * 0.30, color: '#60a5fa', w: 3.5 },
              ].map(({ ar, color, w }) => (
                <path
                  key={ar}
                  d={`M ${cx - ar} ${cy + ar * 0.1} A ${ar} ${ar} 0 0 1 ${cx + ar} ${cy + ar * 0.1}`}
                  stroke={color}
                  strokeWidth={w}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>
          )}
        </>
      )}

      {/* Unicorn horn */}
      {isUnicorn && (
        <g>
          <path
            d={`M ${cx - radius * 0.12} ${cy - radius + 2} L ${cx + radius * 0.12} ${cy - radius + 2} L ${cx} ${cy - radius * 1.55} Z`}
            fill={`url(#horn-${balloon.id})`}
            stroke="rgba(180,120,0,0.55)"
            strokeWidth="0.8"
          />
          <line x1={cx - radius * 0.07} y1={cy - radius + 5} x2={cx + radius * 0.04} y2={cy - radius * 1.25} stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round" />
          <text x={cx + radius * 0.75} y={cy - radius * 0.42} fontSize="9" textAnchor="middle" style={{ userSelect: 'none' }}>✨</text>
        </g>
      )}

      <path d={`M ${cx - 4.2} ${knotY - 1} L ${cx + 4.2} ${knotY - 1} L ${cx + 2.5} ${knotY + 5.8} L ${cx - 2.5} ${knotY + 5.8} Z`} fill="rgba(130,80,35,0.9)" />
      <path d={stringPath} stroke="rgba(110,76,40,0.78)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Tiny monkey hangs from the bottom of each floating balloon string */}
      <line
        x1={cx}
        y1={stringEndY - 10}
        x2={cx}
        y2={stringEndY - 2}
        stroke="rgba(95,70,34,0.85)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={stringEndY + 10}
        textAnchor="middle"
        fontSize="14"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
      >
        🐒
      </text>

      {(meta.icon || meta.text || type === 'bomb') && (
        <text
          x={cx}
          y={cy + (type.startsWith('powerup') ? 4 : 6)}
          textAnchor="middle"
          fontFamily="'Lilita One', cursive"
          fontSize={type === 'multiplier' ? '16' : type.startsWith('powerup') ? '22' : '18'}
          fill="#fff"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="0.9"
        >
          {meta.icon || meta.text || '💣'}
        </text>
      )}

      {type.startsWith('powerup') && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={radius + 5}
            fill="none"
            stroke={meta.color || '#fff'}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.9"
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'powerup-ring-spin 2.4s linear infinite' }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={radius + 9}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.2"
            strokeDasharray="3 7"
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'powerup-ring-spin 4s linear infinite reverse' }}
          />
          <text
            x={cx}
            y={cy + radius + 22}
            textAnchor="middle"
            fontFamily="'Lilita One', cursive"
            fontSize="9"
            fill="#fff"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.2"
            letterSpacing="0.5"
          >
            {meta.label?.toUpperCase()}
          </text>
        </>
      )}

      {type === 'armored' && (
        <text
          x={cx}
          y={cy + 26}
          textAnchor="middle"
          fontFamily="'Lilita One', cursive"
          fontSize="12"
          fill="#fef08a"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.6"
        >
          {hp}/{hpMax}
        </text>
      )}
    </svg>
  );
},
// Custom comparator: skip re-render when only x/y/vx/vy changed
(prev, next) =>
  prev.popFx === next.popFx &&
  prev.colorAssist === next.colorAssist &&
  prev.stringSway === next.stringSway &&
  prev.balloon.id === next.balloon.id &&
  prev.balloon.type === next.balloon.type &&
  prev.balloon.w === next.balloon.w &&
  prev.balloon.h === next.balloon.h &&
  prev.balloon.hitFlash === next.balloon.hitFlash &&
  prev.balloon.hp === next.balloon.hp
);

function PopBurst({ particle }) {
  const confetti = !!particle.confetti;
  return (
    <div
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: confetti ? particle.size * 0.65 : particle.size,
        borderRadius: confetti ? 3 : '50%',
        background: particle.color,
        animation: 'pop-burst 0.55s ease-out forwards',
        '--dx': `${particle.dx}px`,
        '--dy': `${particle.dy}px`,
        transform: `rotate(${particle.spin || 0}deg)`,
        pointerEvents: 'none',
        boxShadow: confetti ? '0 0 6px rgba(255,255,255,0.35)' : 'none',
      }}
    />
  );
}

function Stars({ count }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            fontSize: 44,
            opacity: i < count ? 1 : 0.22,
            filter: i < count ? 'drop-shadow(0 0 14px rgba(255,217,61,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))' : 'none',
            // Initial delay of 0.35s lets the level-complete card animate in first
            animation: i < count ? `star-pop 0.72s cubic-bezier(0.34,1.56,0.64,1) ${0.35 + i * 0.22}s both` : 'none',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

// Memoized so decorations don't re-randomize on every parent render (60fps)
const WorldBackdrop = React.memo(function WorldBackdrop({ worldIdx }) {
  const world = WORLDS[worldIdx] || WORLDS[0];
  const { top, mid, bot } = world.palette;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${bot} 100%)`,
          transition: 'background 1.4s ease',
          overflow: 'hidden',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(280px 160px at 20% 10%, rgba(255,255,255,0.22) 0%, transparent 70%), radial-gradient(340px 200px at 84% 14%, ${top}33 0%, transparent 74%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 24%, rgba(10,18,41,0.08) 100%)`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`spark-${worldIdx}-${i}`}
          style={{
            position: 'absolute',
            top: rand(42, 340),
            left: rand(18, 360),
            width: rand(4, 8),
            height: rand(4, 8),
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.62)',
            boxShadow: `0 0 10px ${mid}99`,
            opacity: 0.35,
            animation: `twinkle ${rand(2.4, 5).toFixed(2)}s ease-in-out ${-rand(0, 4).toFixed(2)}s infinite`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      ))}

      {world.deco === 'clouds' && (
        <>
          <div style={cloudStyle('drift-r 28s linear infinite', 80, 32)}>☁️ ☁️ ☁️</div>
          <div style={cloudStyle('drift-l 24s linear infinite', 180, 21, 0.75)}>☁️ ☁️</div>
          <div style={cloudStyle('drift-r 30s linear infinite', 360, 28, 0.72)}>☁️ ☁️ ☁️</div>
        </>
      )}

      {world.deco === 'sunrise' && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: 170,
              left: 118,
              width: 155,
              height: 155,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffeaa7 0%, #ffd86f 45%, rgba(255,216,111,0) 72%)',
              filter: 'blur(1px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 200,
              background:
                'linear-gradient(180deg, rgba(127,63,0,0) 0%, rgba(95,55,29,0.38) 30%, rgba(67,37,25,0.66) 100%)',
              clipPath: 'polygon(0 100%, 0 56%, 14% 45%, 26% 58%, 40% 38%, 56% 60%, 68% 40%, 82% 55%, 100% 35%, 100% 100%)',
            }}
          />
        </>
      )}

      {world.deco === 'storm' && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`storm-${i}`}
              style={{
                position: 'absolute',
                top: rand(40, 260),
                left: rand(30, 340),
                color: '#fff9a8',
                fontSize: rand(26, 40),
                opacity: 0.22,
                animation: `flicker ${rand(4, 6).toFixed(2)}s linear infinite`,
              }}
            >
              ⚡
            </div>
          ))}
        </>
      )}

      {world.deco === 'crystals' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`cr-${i}`}
              style={{
                position: 'absolute',
                top: rand(70, 620),
                left: rand(15, 350),
                fontSize: rand(18, 30),
                opacity: rand(0.2, 0.5),
                animation: `pulse-slow ${rand(3, 5).toFixed(2)}s ease-in-out infinite`,
              }}
            >
              💎
            </div>
          ))}
        </>
      )}

      {world.deco === 'snow' && (
        <>
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`snow-${i}`}
              style={{
                position: 'absolute',
                left: rand(0, GAME_W),
                top: -30 - i * 18,
                width: rand(4, 9),
                height: rand(4, 9),
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                animation: `snow-fall ${rand(8, 12).toFixed(2)}s linear ${-rand(0, 12).toFixed(2)}s infinite`,
              }}
            />
          ))}
        </>
      )}

      {world.deco === 'stars' && (
        <>
          <div style={{ position: 'absolute', top: 22, right: 28, fontSize: 38, opacity: 0.72 }}>🌙</div>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`tw-${i}`}
              style={{
                position: 'absolute',
                top: rand(14, 470),
                left: rand(8, 378),
                width: rand(2, 5),
                height: rand(2, 5),
                borderRadius: '50%',
                background: '#fff7d4',
                boxShadow: '0 0 10px rgba(255,240,190,0.8)',
                animation: `twinkle ${rand(1.5, 4).toFixed(2)}s ease-in-out ${-rand(0, 4).toFixed(2)}s infinite`,
              }}
            />
          ))}
        </>
      )}

      {world.deco === 'citadel' && (
        <>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 230,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(18,8,36,0.45) 40%, rgba(12,7,25,0.85) 100%)',
              clipPath:
                'polygon(0 100%, 0 64%, 8% 64%, 8% 46%, 16% 46%, 16% 64%, 28% 64%, 28% 38%, 38% 38%, 38% 64%, 47% 64%, 47% 26%, 54% 26%, 54% 64%, 64% 64%, 64% 44%, 74% 44%, 74% 64%, 84% 64%, 84% 50%, 92% 50%, 92% 64%, 100% 64%, 100% 100%)',
            }}
          />
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={`light-${i}`}
              style={{
                position: 'absolute',
                bottom: rand(60, 200),
                left: rand(8, 380),
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#ffd76f',
                animation: `twinkle ${rand(1.2, 2.8).toFixed(2)}s ease-in-out ${-rand(0, 3).toFixed(2)}s infinite`,
              }}
            />
          ))}
        </>
      )}
    </>
  );
});

function cloudStyle(animation, top, size, opacity = 1) {
  return {
    position: 'absolute',
    top,
    left: -180,
    fontSize: size,
    opacity,
    animation,
    filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.12))',
    userSelect: 'none',
    pointerEvents: 'none',
  };
}

// ── Custom SVG icon components ────────────────────────────────────────────────
function IconStar({ size = 18, color = '#FFD93D' }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <polygon points="16,2 20,11 30,12 23,19 25,29 16,24 7,29 9,19 2,12 12,11" fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
    </svg>
  );
}
function IconLock({ size = 28 }) {
  return (
    <svg viewBox="0 0 32 38" width={size} height={Math.round(size * 1.2)}>
      <rect x="6" y="16" width="20" height="16" rx="4" fill="#b8860b" />
      <rect x="8" y="18" width="16" height="12" rx="3" fill="#FFD93D" />
      <path d="M10 16 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="16" cy="24" r="2.5" fill="#b8860b" />
    </svg>
  );
}
function IconCampaign({ size = 22 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <rect x="4" y="6" width="28" height="22" rx="4" fill="#a08040" stroke="#7a5c20" strokeWidth="1.5" />
      <rect x="6" y="8" width="24" height="18" rx="2.5" fill="#f5e0a0" />
      <line x1="11" y1="13" x2="25" y2="13" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="17" x2="22" y2="17" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="21" x2="19" y2="21" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="20" r="4" fill="#4D96FF" stroke="#fff" strokeWidth="1.2" />
      <polygon points="26,17.5 27.3,19.8 25,21.2 26,17.5" fill="#fff" />
      {/* tiny balloon tethered above */}
      <ellipse cx="30" cy="7" rx="4" ry="4.5" fill="#FF6B6B" />
      <line x1="30" y1="11.5" x2="29" y2="14" stroke="#555" strokeWidth="1" />
    </svg>
  );
}
function IconSurvival({ size = 22 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <path d="M18 3 L22 10 L30 11 L24 17 L26 26 L18 22 L10 26 L12 17 L6 11 L14 10 Z" fill="none" stroke="#FF9F43" strokeWidth="2" />
      <path d="M12 28 L8 34 M24 28 L28 34 M8 34 L28 34" stroke="#c0730a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="10" x2="26" y2="26" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
      <line x1="26" y1="10" x2="10" y2="26" stroke="#ffd278" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function IconZen({ size = 22 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <ellipse cx="18" cy="22" rx="14" ry="7" fill="#a8cce8" opacity="0.85" />
      <ellipse cx="11" cy="18" rx="9" ry="5.5" fill="#c5dff5" opacity="0.8" />
      <ellipse cx="25" cy="17" rx="8" ry="5" fill="#d8ecf8" opacity="0.8" />
      <ellipse cx="18" cy="12" rx="11" ry="7" fill="#fff" opacity="0.92" />
      {/* tiny calm balloon floating */}
      <ellipse cx="18" cy="5" rx="5" ry="5.5" fill="#A855F7" opacity="0.9" />
      <ellipse cx="15.5" cy="2.5" rx="1.8" ry="2.5" fill="rgba(255,255,255,0.38)" />
      <line x1="18" y1="10.5" x2="18" y2="14" stroke="#7c3aed" strokeWidth="1.2" />
    </svg>
  );
}
function IconSettings({ size = 22 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="18" cy="18" r="5.5" fill="#00b894" stroke="#fff" strokeWidth="1.8" />
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const r = Math.PI * a / 180;
        const x1 = 18 + Math.cos(r) * 8;
        const y1 = 18 + Math.sin(r) * 8;
        const x2 = 18 + Math.cos(r) * 12;
        const y2 = 18 + Math.sin(r) * 12;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00b894" strokeWidth="2.8" strokeLinecap="round" />;
      })}
    </svg>
  );
}
function IconCredits({ size = 22 }) {
  return (
    <svg viewBox="0 0 36 42" width={size} height={Math.round(size * 1.17)}>
      <rect x="5" y="3" width="26" height="34" rx="4" fill="#e8d5b0" stroke="#a07840" strokeWidth="1.5" />
      <path d="M5 7 Q18 2 31 7" fill="#c9a860" />
      <path d="M5 36 Q18 41 31 36" fill="#c9a860" />
      <line x1="10" y1="13" x2="26" y2="13" stroke="#7a5c30" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="18" x2="26" y2="18" stroke="#7a5c30" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="23" x2="22" y2="23" stroke="#7a5c30" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="28" x2="18" y2="28" stroke="#7a5c30" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconCrown({ size = 34 }) {
  return (
    <svg viewBox="0 0 48 36" width={size} height={Math.round(size * 0.75)}>
      <path d="M4 30 L8 14 L16 22 L24 8 L32 22 L40 14 L44 30 Z" fill="#FFD93D" stroke="#c28400" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="4" y="28" width="40" height="6" rx="2" fill="#c28400" />
      <circle cx="24" cy="8" r="3" fill="#FF6B6B" />
      <circle cx="8" cy="14" r="2.5" fill="#A855F7" />
      <circle cx="40" cy="14" r="2.5" fill="#A855F7" />
    </svg>
  );
}
// World icons
function IconWorldCloud({ size = 34 }) {
  return (
    <svg viewBox="0 0 48 40" width={size} height={Math.round(size * 0.83)}>
      <ellipse cx="24" cy="28" rx="18" ry="10" fill="#c9e8f5" />
      <ellipse cx="16" cy="22" rx="11" ry="8" fill="#d8f0fa" />
      <ellipse cx="32" cy="20" rx="10" ry="7" fill="#e8f5ff" />
      <ellipse cx="24" cy="16" rx="13" ry="9" fill="#fff" />
      <ellipse cx="20" cy="10" rx="5" ry="6" fill="#fff" />
      <ellipse cx="30" cy="11" rx="7" ry="7" fill="#fff" />
    </svg>
  );
}
function IconWorldSunrise({ size = 34 }) {
  return (
    <svg viewBox="0 0 48 44" width={size} height={Math.round(size * 0.92)}>
      <line x1="24" y1="2" x2="24" y2="8" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
      <line x1="8"  y1="7"  x2="12" y2="11" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="7"  x2="36" y2="11" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
      <line x1="2"  y1="20" x2="8"  y2="20" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="20" x2="40" y2="20" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 32 A16 16 0 0 1 40 32 Z" fill="#FFD93D" />
      <line x1="2" y1="34" x2="46" y2="34" stroke="#FF9F43" strokeWidth="3" strokeLinecap="round" />
      <line x1="2" y1="40" x2="46" y2="40" stroke="#ff6b6b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconWorldStorm({ size = 34 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <ellipse cx="24" cy="14" rx="18" ry="11" fill="#7c6fa0" />
      <ellipse cx="16" cy="10" rx="10" ry="7" fill="#9c8fc0" />
      <ellipse cx="32" cy="9"  rx="9"  ry="6" fill="#b0a4d5" />
      <polygon points="22,22 18,34 23,34 20,46 30,30 25,30 28,22" fill="#FFD93D" />
    </svg>
  );
}
function IconWorldCrystal({ size = 34 }) {
  return (
    <svg viewBox="0 0 40 52" width={size} height={Math.round(size * 1.3)}>
      <polygon points="20,2 36,16 30,50 20,44 10,50 4,16" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="1.5" />
      <polygon points="20,2 36,16 20,14" fill="rgba(255,255,255,0.55)" />
      <polygon points="20,2 4,16 20,14" fill="rgba(255,255,255,0.28)" />
      <polygon points="20,14 36,16 30,50 20,44" fill="rgba(0,180,200,0.5)" />
      <polygon points="20,14 4,16 10,50 20,44" fill="rgba(0,220,240,0.35)" />
    </svg>
  );
}
function IconWorldSnow({ size = 34 }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size}>
      {[0, 60, 120].map((a, i) => {
        const r = Math.PI * a / 180;
        return (
          <g key={i}>
            <line x1={22 + Math.cos(r) * 18} y1={22 + Math.sin(r) * 18} x2={22 - Math.cos(r) * 18} y2={22 - Math.sin(r) * 18} stroke="#a8cce8" strokeWidth="3" strokeLinecap="round" />
            {[-1, 1].map((s, j) => {
              const r2 = r + s * 0.7;
              return (
                <line key={j}
                  x1={22 + Math.cos(r) * 10} y1={22 + Math.sin(r) * 10}
                  x2={22 + Math.cos(r) * 10 + Math.cos(r2) * 5} y2={22 + Math.sin(r) * 10 + Math.sin(r2) * 5}
                  stroke="#c8e4f4" strokeWidth="2" strokeLinecap="round" />
              );
            })}
          </g>
        );
      })}
      <circle cx="22" cy="22" r="3.5" fill="#fff" />
    </svg>
  );
}
function IconWorldMoon({ size = 34 }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size}>
      <path d="M30 8 A14 14 0 1 0 30 36 A10 10 0 1 1 30 8 Z" fill="#c084fc" />
      {[[34,10,1.5],[38,20,1],[32,26,1.2],[28,8,0.8],[24,15,1]].map(([cx,cy,r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#FFD93D" />
      ))}
    </svg>
  );
}
// Level type icons
function IconBalloon({ size = 18 }) {
  return (
    <svg viewBox="0 0 32 44" width={size} height={Math.round(size * 1.37)}>
      <ellipse cx="16" cy="18" rx="13" ry="15" fill="#4D96FF" />
      <ellipse cx="10" cy="10" rx="4" ry="5.5" fill="rgba(255,255,255,0.35)" />
      <path d="M16 33 C 13 37, 12 40, 16 44" stroke="rgba(60,40,10,0.5)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function IconFlame({ size = 18 }) {
  return (
    <svg viewBox="0 0 32 44" width={size} height={Math.round(size * 1.37)}>
      <path d="M16 2 C 16 2, 26 12, 26 24 C 26 34, 20 42, 16 42 C 12 42, 6 34, 6 24 C 6 14, 14 8, 14 8 C 14 8, 10 18, 14 22 C 15 14, 20 10, 16 2 Z" fill="#FF9F43" />
      <path d="M16 16 C 16 16, 22 22, 22 30 C 22 36, 19 40, 16 40 C 13 40, 10 36, 10 30 C 10 24, 14 18, 16 16 Z" fill="#ff6b6b" />
      <path d="M16 28 C 16 28, 19 32, 19 36 C 19 39, 17.5 41, 16 41 C 14.5 41, 13 39, 13 36 C 13 32, 16 28, 16 28 Z" fill="#FFD93D" />
    </svg>
  );
}
function IconChain({ size = 18 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      {[[8,8],[16,16],[24,24]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="6" ry="4" fill="none" stroke="#A855F7" strokeWidth="2.8" transform={`rotate(-45 ${cx} ${cy})`} />
      ))}
      <ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="#A855F7" strokeWidth="2.8" transform="rotate(-45 8 8)" />
      <ellipse cx="24" cy="24" rx="6" ry="4" fill="none" stroke="#A855F7" strokeWidth="2.8" transform="rotate(-45 24 24)" />
    </svg>
  );
}
function IconTarget({ size = 18 }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size}>
      <circle cx="18" cy="18" r="15" fill="none" stroke="#00b3a4" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="10" fill="none" stroke="#00b3a4" strokeWidth="2" />
      <circle cx="18" cy="18" r="5"  fill="none" stroke="#ff6b6b" strokeWidth="2" />
      <circle cx="18" cy="18" r="2"  fill="#ff6b6b" />
      <line x1="18" y1="2"  x2="18" y2="8"  stroke="#00b3a4" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="28" x2="18" y2="34" stroke="#00b3a4" strokeWidth="2" strokeLinecap="round" />
      <line x1="2"  y1="18" x2="8"  y2="18" stroke="#00b3a4" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="18" x2="34" y2="18" stroke="#00b3a4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconSkull({ size = 18 }) {
  return (
    <svg viewBox="0 0 36 40" width={size} height={Math.round(size * 1.1)}>
      <path d="M18 2 C8 2, 3 9, 3 17 C3 23, 6 27, 10 29 L10 36 L26 36 L26 29 C30 27, 33 23, 33 17 C33 9, 28 2, 18 2 Z" fill="#c0b8d0" stroke="#7c7090" strokeWidth="1.5" />
      <circle cx="12" cy="18" r="4.5" fill="#2d2540" />
      <circle cx="24" cy="18" r="4.5" fill="#2d2540" />
      <line x1="14" y1="32" x2="14" y2="36" stroke="#7c7090" strokeWidth="2" />
      <line x1="18" y1="30" x2="18" y2="36" stroke="#7c7090" strokeWidth="2" />
      <line x1="22" y1="32" x2="22" y2="36" stroke="#7c7090" strokeWidth="2" />
    </svg>
  );
}
function IconBoss({ size = 18 }) {
  return (
    <svg viewBox="0 0 40 44" width={size} height={Math.round(size * 1.1)}>
      {/* horns */}
      <path d="M8 16 C 4 8, 2 4, 6 2 C 8 6, 10 12, 10 16" fill="#8B0000" />
      <path d="M32 16 C 36 8, 38 4, 34 2 C 32 6, 30 12, 30 16" fill="#8B0000" />
      {/* head */}
      <ellipse cx="20" cy="26" rx="16" ry="18" fill="#DC2626" stroke="#7f1d1d" strokeWidth="1.5" />
      {/* eyes */}
      <ellipse cx="14" cy="22" rx="4" ry="4.5" fill="#FFD93D" />
      <ellipse cx="26" cy="22" rx="4" ry="4.5" fill="#FFD93D" />
      <circle cx="14" cy="23" r="2" fill="#1a0000" />
      <circle cx="26" cy="23" r="2" fill="#1a0000" />
      {/* snarl */}
      <path d="M12 33 L14 30 L16 33 L18 30 L20 33 L22 30 L24 33 L26 30 L28 33" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Per-world metadata ────────────────────────────────────────────────────────
const WORLD_META = [
  { icon: IconWorldCloud,   tagline: 'Where every journey begins',    balloonColors: ['#87ceeb', '#FFD93D', '#6BCB77'] },
  { icon: IconWorldSunrise, tagline: 'Race the dawn winds',           balloonColors: ['#FF9F43', '#ff6b6b', '#FFD93D'] },
  { icon: IconWorldStorm,   tagline: 'Thunder never sleeps',          balloonColors: ['#A855F7', '#4D96FF', '#c084fc'] },
  { icon: IconWorldCrystal, tagline: 'Crystal clear and deadly',      balloonColors: ['#00b3a4', '#38bdf8', '#6fd6c7'] },
  { icon: IconWorldSnow,    tagline: 'The cold that freezes time',    balloonColors: ['#6ea5d9', '#a8cce8', '#38bdf8'] },
  { icon: IconWorldMoon,    tagline: 'Stars bloom at midnight',       balloonColors: ['#A855F7', '#c084fc', '#FFD93D'] },
  { icon: IconCrown,        tagline: 'Claim the crown — if you dare', balloonColors: ['#FFD93D', '#ff6b6b', '#A855F7'] },
];

// ─── Daily Challenges ──────────────────────────────────────────────────────
const DAILY_CHALLENGE_POOL = [
  { id: 'pop-80',        label: 'Pop 80 balloons',             goal: 80,  type: 'totalPops',     icon: '🎈' },
  { id: 'pop-150',       label: 'Pop 150 balloons',            goal: 150, type: 'totalPops',     icon: '🎈' },
  { id: 'pop-heart-8',   label: 'Pop 8 Heart balloons',        goal: 8,   type: 'heartPops',     icon: '❤️' },
  { id: 'pop-unicorn-4', label: 'Pop 4 Unicorn balloons',      goal: 4,   type: 'unicornPops',   icon: '🦄' },
  { id: 'pop-rainbow-3', label: 'Pop 3 Rainbow balloons',      goal: 3,   type: 'rainbowPops',   icon: '🌈' },
  { id: 'pop-golden-3',  label: 'Pop 3 Golden balloons',       goal: 3,   type: 'goldenPops',    icon: '✨' },
  { id: 'combo-12',      label: 'Reach a 12x combo',           goal: 12,  type: 'maxCombo',      icon: '🔥' },
  { id: 'combo-20',      label: 'Reach a 20x combo',           goal: 20,  type: 'maxCombo',      icon: '🔥' },
  { id: 'win-2',         label: 'Win 2 campaign levels',       goal: 2,   type: 'levelsWon',     icon: '🏆' },
  { id: 'win-4',         label: 'Win 4 campaign levels',       goal: 4,   type: 'levelsWon',     icon: '🏆' },
  { id: 'perfect-1',    label: 'Finish a level, 0 escapes',    goal: 1,   type: 'perfectLevels', icon: '🎯' },
  { id: 'survive-30',    label: 'Survive 30s in Survival',     goal: 30,  type: 'survivalTime',  icon: '⏱️' },
];

function getDailyDate() {
  return new Date().toISOString().slice(0, 10);
}

function generateDailyChallenges(dateStr) {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) | 0;
  const lcg = () => { seed = (seed * 1664525 + 1013904223) | 0; return Math.abs(seed); };
  const pool = [...DAILY_CHALLENGE_POOL];
  const picked = [];
  while (picked.length < 3 && pool.length > 0) {
    const idx = lcg() % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

// ─── Achievements ─────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'pop-1',      icon: '🎈', label: 'First Pop!',      desc: 'Pop your first balloon',          check: (s) => (s.totalPops || 0) >= 1 },
  { id: 'pop-100',    icon: '💯', label: 'Centurion',       desc: 'Pop 100 balloons total',          check: (s) => (s.totalPops || 0) >= 100 },
  { id: 'pop-500',    icon: '🏭', label: 'Pop Factory',     desc: 'Pop 500 balloons total',          check: (s) => (s.totalPops || 0) >= 500 },
  { id: 'pop-1000',   icon: '💥', label: 'Thousand Pops',   desc: 'Pop 1 000 balloons total',        check: (s) => (s.totalPops || 0) >= 1000 },
  { id: 'combo-10',   icon: '🔗', label: 'Chain Starter',   desc: 'Reach a 10x combo',               check: (s) => (s.bestCombo || 0) >= 10 },
  { id: 'combo-30',   icon: '🔥', label: 'Inferno',         desc: 'Reach a 30x combo',               check: (s) => (s.bestCombo || 0) >= 30 },
  { id: 'combo-50',   icon: '⚡', label: 'Unstoppable',     desc: 'Reach a 50x combo',               check: (s) => (s.bestCombo || 0) >= 50 },
  { id: 'world-0',    icon: '☁️', label: 'Meadow Knight',   desc: 'Clear World 1',                   check: (s) => !!s.unlockedBadges?.['world-0'] },
  { id: 'world-1',    icon: '🌅', label: 'Dawn Chaser',     desc: 'Clear World 2',                   check: (s) => !!s.unlockedBadges?.['world-1'] },
  { id: 'world-2',    icon: '⛈️', label: 'Storm Tamer',     desc: 'Clear World 3',                   check: (s) => !!s.unlockedBadges?.['world-2'] },
  { id: 'world-3',    icon: '💎', label: 'Crystal Warden',  desc: 'Clear World 4',                   check: (s) => !!s.unlockedBadges?.['world-3'] },
  { id: 'world-4',    icon: '❄️', label: 'Frost Marshal',   desc: 'Clear World 5',                   check: (s) => !!s.unlockedBadges?.['world-4'] },
  { id: 'world-5',    icon: '🌟', label: 'Star Keeper',     desc: 'Clear World 6',                   check: (s) => !!s.unlockedBadges?.['world-5'] },
  { id: 'world-6',    icon: '👑', label: 'Sky Monarch',     desc: 'Clear all 7 worlds',              check: (s) => !!s.unlockedBadges?.['world-6'] },
  { id: 'survive-30', icon: '⏱️', label: 'Survivor',        desc: 'Survive 30 seconds',              check: (s) => (s.survivalBestTime || 0) >= 30 },
  { id: 'survive-60', icon: '🛡️', label: 'Iron Balloon',    desc: 'Survive 60 seconds',              check: (s) => (s.survivalBestTime || 0) >= 60 },
  { id: 'perfect-1',  icon: '🌠', label: 'Pristine',        desc: 'Complete a level with no escapes', check: (s) => (s.perfectLevels || 0) >= 1 },
  { id: 'stars-30',   icon: '⭐', label: 'Rising Star',      desc: 'Earn 30 total stars',             check: (s) => (s.totalStars || 0) >= 30 },
  { id: 'stars-90',   icon: '✨', label: 'Star Collector',   desc: 'Earn 90 total stars',             check: (s) => (s.totalStars || 0) >= 90 },
  { id: 'zen-500',    icon: '🧘', label: 'Zen Master',       desc: 'Pop 500 balloons in Zen mode',    check: (s) => (s.zenPops || 0) >= 500 },
];

function checkAndAwardAchievements(save) {
  const newBadges = {};
  for (const ach of ACHIEVEMENTS) {
    const key = `ach-${ach.id}`;
    if (!save.unlockedBadges?.[key] && ach.check(save)) {
      newBadges[key] = true;
    }
  }
  return newBadges;
}

function mergeDailyProgress(baseProgress = {}, deltas = {}) {
  const next = { ...baseProgress };
  Object.entries(deltas).forEach(([key, delta]) => {
    if (delta == null) return;
    if (key === 'maxCombo' || key === 'survivalTime') {
      next[key] = Math.max(next[key] || 0, delta);
    } else {
      next[key] = (next[key] || 0) + delta;
    }
  });
  return next;
}

// ─── Balloon Skins ────────────────────────────────────────────────────────
const BALLOON_SKINS = [
  { id: 'classic', label: 'Classic', starsNeeded: 0,   desc: 'The original look',     filter: null },
  { id: 'golden',  label: 'Golden',  starsNeeded: 15,  desc: 'Gilded radiant glow',   filter: 'sepia(0.6) saturate(1.8) hue-rotate(10deg) brightness(1.15)' },
  { id: 'neon',    label: 'Neon',    starsNeeded: 40,  desc: 'Electric neon shimmer', filter: 'saturate(2.5) brightness(1.25) contrast(1.15)' },
  { id: 'galaxy',  label: 'Galaxy',  starsNeeded: 80,  desc: 'Deep-space shimmer',    filter: 'hue-rotate(200deg) saturate(1.8) brightness(0.9)' },
  { id: 'crystal', label: 'Crystal', starsNeeded: 140, desc: 'Icy crystal radiance',  filter: 'hue-rotate(170deg) saturate(1.6) brightness(1.2)' },
  { id: 'royal',   label: 'Royal',   starsNeeded: 220, desc: 'Crown-worthy splendor', filter: 'sepia(0.3) hue-rotate(290deg) saturate(2) brightness(1.1)' },
];

const LEVEL_TYPE_COLORS = {
  Normal:      ['rgba(77,150,255,0.7)',   'rgba(135,209,255,0.4)'],
  ScoreAttack: ['rgba(255,159,67,0.75)',  'rgba(255,210,120,0.4)'],
  Chain:       ['rgba(168,85,247,0.75)',  'rgba(212,160,255,0.4)'],
  Precision:   ['rgba(0,184,148,0.7)',    'rgba(120,243,206,0.4)'],
  Survival:    ['rgba(255,107,107,0.75)', 'rgba(255,159,159,0.4)'],
  Boss:        ['rgba(220,38,38,0.8)',    'rgba(248,113,113,0.4)'],
};

const LEVEL_TYPE_ICONS = {
  Normal: IconBalloon, ScoreAttack: IconFlame, Chain: IconChain, Precision: IconTarget, Survival: IconSkull, Boss: IconBoss,
};

// Reusable tiny balloon SVG decoration
function DecoBalloon({ color, size }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={Math.round(size * 1.35)}>
      <ellipse cx="30" cy="34" rx="26" ry="30" fill={color} />
      <ellipse cx="20" cy="20" rx="8" ry="11" fill="rgba(255,255,255,0.32)" />
      <path d="M30 64 C 26 68, 24 74, 30 82" stroke="rgba(90,60,30,0.5)" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function HomeCastleHero() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 24,
        transform: 'translateX(-50%)',
        width: 320,
        height: 220,
        zIndex: 3,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 16px 26px rgba(12,22,44,0.34))',
      }}
    >
      <svg viewBox="0 0 320 220" width="320" height="220" aria-hidden="true">
        <defs>
          <linearGradient id="homeCastleSkyGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="homeCastleStone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dde9ff" />
            <stop offset="50%" stopColor="#b7cbf4" />
            <stop offset="100%" stopColor="#6e86b9" />
          </linearGradient>
          <linearGradient id="homeCastleRoof" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffcf5a" />
            <stop offset="45%" stopColor="#ff8a5b" />
            <stop offset="100%" stopColor="#c155ff" />
          </linearGradient>
          <linearGradient id="homeCastleGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff2a8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <ellipse cx="160" cy="182" rx="126" ry="26" fill="rgba(41,64,126,0.22)" />
        <ellipse cx="160" cy="174" rx="104" ry="18" fill="rgba(255,255,255,0.18)" />

        <g opacity="0.55">
          <path d="M64 150 C 88 118, 116 102, 160 102 C 204 102, 236 118, 258 150" fill="none" stroke="url(#homeCastleSkyGlow)" strokeWidth="16" strokeLinecap="round" />
        </g>

        <g fill="url(#homeCastleStone)" stroke="rgba(50,72,122,0.55)" strokeWidth="2">
          <rect x="86" y="102" width="148" height="62" rx="8" />
          <rect x="64" y="88" width="28" height="76" rx="5" />
          <rect x="228" y="88" width="28" height="76" rx="5" />
          <rect x="140" y="72" width="40" height="92" rx="6" />
          <rect x="36" y="112" width="26" height="52" rx="4" />
          <rect x="258" y="112" width="26" height="52" rx="4" />
        </g>

        <g fill="rgba(59,88,151,0.78)">
          {Array.from({ length: 8 }).map((_, i) => <rect key={`m1-${i}`} x={90 + i * 18} y="96" width="9" height="8" rx="1.5" />)}
          {Array.from({ length: 3 }).map((_, i) => <rect key={`m2-${i}`} x={66 + i * 10} y="82" width="7" height="7" rx="1.3" />)}
          {Array.from({ length: 3 }).map((_, i) => <rect key={`m3-${i}`} x={230 + i * 10} y="82" width="7" height="7" rx="1.3" />)}
          <rect x="146" y="66" width="8" height="8" rx="1.5" />
          <rect x="158" y="66" width="8" height="8" rx="1.5" />
          <rect x="170" y="66" width="8" height="8" rx="1.5" />
        </g>

        <g fill="url(#homeCastleRoof)">
          <path d="M60 88 L78 62 L96 88 Z" />
          <path d="M136 72 L160 36 L184 72 Z" />
          <path d="M224 88 L242 62 L260 88 Z" />
          <path d="M32 112 L49 90 L66 112 Z" />
          <path d="M254 112 L271 90 L288 112 Z" />
        </g>

        <g stroke="rgba(76,39,7,0.7)" strokeWidth="2">
          <line x1="78" y1="62" x2="78" y2="48" />
          <line x1="160" y1="36" x2="160" y2="18" />
          <line x1="242" y1="62" x2="242" y2="48" />
          <line x1="49" y1="90" x2="49" y2="76" />
          <line x1="271" y1="90" x2="271" y2="76" />
        </g>

        <g fill="url(#homeCastleGold)">
          <path d="M78 48 L90 52 L78 58 Z" />
          <path d="M160 18 L174 24 L160 32 Z" />
          <path d="M242 48 L254 52 L242 58 Z" />
          <path d="M49 76 L61 80 L49 86 Z" />
          <path d="M271 76 L283 80 L271 86 Z" />
        </g>

        <g fill="rgba(249,250,251,0.86)">
          <rect x="76" y="112" width="8" height="14" rx="3" />
          <rect x="236" y="112" width="8" height="14" rx="3" />
          <rect x="114" y="118" width="9" height="16" rx="3" />
          <rect x="197" y="118" width="9" height="16" rx="3" />
          <rect x="154" y="84" width="12" height="18" rx="4" />
          <rect x="44" y="126" width="7" height="12" rx="2.5" />
          <rect x="270" y="126" width="7" height="12" rx="2.5" />
        </g>

        <path d="M144 164 L144 136 A16 16 0 0 1 176 136 L176 164 Z" fill="rgba(48,63,107,0.78)" />
        <path d="M151 164 L151 142 A9 9 0 0 1 169 142 L169 164 Z" fill="rgba(255,231,160,0.3)" />

        <g opacity="0.6">
          <circle cx="122" cy="94" r="4" fill="rgba(255,255,255,0.66)" />
          <circle cx="198" cy="88" r="3.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="96" cy="74" r="3" fill="rgba(255,255,255,0.55)" />
          <circle cx="228" cy="70" r="3" fill="rgba(255,255,255,0.55)" />
        </g>
      </svg>
    </div>
  );
}

const HOME_BALLOONS = [
  { left: '7%',  bottom: '-64px', color: '#FF6B6B', size: 46, dur: 9.2,  delay: 0   },
  { left: '21%', bottom: '-52px', color: '#FFD93D', size: 36, dur: 8.0,  delay: 1.4 },
  { left: '37%', bottom: '-74px', color: '#4D96FF', size: 54, dur: 10.5, delay: 0.7 },
  { left: '55%', bottom: '-48px', color: '#6BCB77', size: 38, dur: 8.8,  delay: 2.2 },
  { left: '70%', bottom: '-68px', color: '#A855F7', size: 48, dur: 9.6,  delay: 3.1 },
  { left: '84%', bottom: '-56px', color: '#FF9F43', size: 40, dur: 8.4,  delay: 1.8 },
  { left: '14%', bottom: '-82px', color: '#FF6FC8', size: 32, dur: 11.0, delay: 4.5 },
  { left: '91%', bottom: '-50px', color: '#38bdf8', size: 38, dur: 9.0,  delay: 3.8 },
];

function HomeScreen({ onStartCampaign, onStartSurvival, onStartZen, onSettings, onCredits, onAchievements, onDailyChallenges, save }) {
  return (
    <div style={screenShell(0)}>
      <WorldBackdrop worldIdx={0} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'radial-gradient(340px 180px at 50% 16%, rgba(255,244,194,0.5) 0%, rgba(255,244,194,0.12) 48%, transparent 72%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 24%, rgba(22,35,68,0.05) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 62,
          transform: 'translateX(-50%)',
          width: 300,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,248,194,0.5) 0%, rgba(255,248,194,0.1) 48%, transparent 76%)',
          filter: 'blur(8px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Floating deco balloons rising from the bottom */}
      {HOME_BALLOONS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.left,
            bottom: b.bottom,
            width: b.size,
            zIndex: 2,
            animation: `home-balloon-rise ${b.dur}s ${b.delay}s linear infinite`,
            pointerEvents: 'none',
          }}
        >
          <DecoBalloon color={b.color} size={b.size} />
        </div>
      ))}

      <HomeCastleHero />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 150,
          zIndex: 3,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(22,31,70,0) 0%, rgba(22,31,70,0.26) 34%, rgba(18,22,52,0.62) 100%)',
        }}
      />

      <div style={{ ...uiLayer, zIndex: 5 }}>
        {/* Crown + Title */}
        <div style={{ marginTop: 34, textAlign: 'center', animation: 'bob 4.5s ease-in-out infinite' }}>
          <div
            style={{
              width: 296,
              marginInline: 'auto',
              padding: '14px 14px 12px',
              borderRadius: 28,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08))',
              border: '2px solid rgba(255,255,255,0.5)',
              boxShadow: '0 14px 30px rgba(28,40,84,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
            }}
          >
          <div style={{ lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', display: 'inline-block' }}><IconCrown size={64} /></div>
          <div style={{ ...titleFont, marginTop: 4 }}>BALLOON POP</div>
          <div
            style={{
              fontFamily: "'Chewy', cursive",
              fontSize: 21,
              letterSpacing: 6,
              color: '#FFD93D',
              transform: 'rotate(1deg)',
              textShadow: '0 2px 0 #c28400, 0 4px 0 rgba(0,0,0,0.2), 0 0 18px rgba(255,217,61,0.8)',
              marginTop: 2,
            }}
          >
            SKY KINGDOM
          </div>
          <div style={{ marginTop: 6, fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.82)', fontFamily: "'Baloo 2', cursive" }}>
            POP • CHAIN • RULE THE SKY
          </div>
          <div style={{ ...levelBadge, width: 234, marginInline: 'auto', marginTop: 10 }}>
            {save.royalTitle || getRoyalTitle(save.totalStars || 0)}
          </div>
          </div>
        </div>

        {/* Main Buttons */}
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center' }}>
          <button style={{ ...bigBtn('#4D96FF', '#87d1ff'), width: 284, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }} onClick={onStartCampaign}>
            <IconCampaign size={24} /> Campaign
          </button>
          <button style={{ ...bigBtn('#FF9F43', '#ffd278'), width: 284, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }} onClick={onStartSurvival}>
            <IconSurvival size={24} /> Survival
          </button>
          <button style={{ ...bigBtn('#A855F7', '#d49aff'), width: 284, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }} onClick={onStartZen}>
            <IconZen size={24} /> Zen Mode
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{ ...bigBtn('#00b894', '#8bf0d7'), width: 134, padding: '12px 10px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={onSettings}
            >
              <IconSettings size={22} /> Settings
            </button>
            <button
              style={{ ...bigBtn('#4f46e5', '#9f8cff'), width: 134, padding: '12px 10px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={onCredits}
            >
              <IconCredits size={22} /> Credits
            </button>
          </div>
        </div>

        {/* Royal Record stats */}
        <div
          style={{
            marginTop: 18,
            marginInline: 'auto',
            width: 300,
            background: 'linear-gradient(135deg, rgba(255,215,60,0.18), rgba(255,255,255,0.06))',
            border: '2px solid rgba(255,215,60,0.45)',
            borderRadius: 20,
            padding: '10px 14px 12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          <div
            style={{
              fontFamily: "'Chewy', cursive",
              fontSize: 12,
              color: '#FFD93D',
              letterSpacing: 3,
              textAlign: 'center',
              opacity: 0.85,
              marginBottom: 8,
            }}
          >
            — ROYAL RECORD —
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { icon: <IconStar size={26} />, value: save.totalStars, label: 'Stars' },
              { icon: <IconSurvival size={26} />, value: save.survivalBest, label: 'Best' },
              { icon: <IconZen size={26} />, value: save.zenPops, label: 'Zen' },
            ].map(({ icon, value, label }) => (
              <div key={label} style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ lineHeight: 1, display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: 18, fontFamily: "'Titan One', cursive" }}>{value}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenge mini-card */}
        {save.dailyChallenges && (() => {
          const dp = save.dailyProgress || {};
          const challenges = save.dailyChallenges;
          const allDone = challenges.every((c) => (dp[c.type] || 0) >= c.goal);
          return (
            <div
              style={{
                marginTop: 12,
                marginInline: 'auto',
                width: 300,
                background: allDone
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.28), rgba(253,224,71,0.14))'
                  : 'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(255,255,255,0.06))',
                border: `2px solid ${allDone ? 'rgba(251,191,36,0.7)' : 'rgba(96,165,250,0.45)'}`,
                borderRadius: 16,
                padding: '9px 12px 10px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontFamily: "'Chewy', cursive", fontSize: 11, color: allDone ? '#fcd34d' : '#93c5fd', letterSpacing: 3, textAlign: 'center', marginBottom: 6 }}>
                — DAILY CHALLENGES {allDone ? '✓ ALL DONE!' : ''} —
              </div>
              {challenges.map((c) => {
                const prog = Math.min(dp[c.type] || 0, c.goal);
                const done = prog >= c.goal;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: done ? '#86efac' : '#fff', fontFamily: "'Baloo 2', cursive", lineHeight: 1.1 }}>{c.label}</div>
                      <div style={{ marginTop: 2, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(prog / c.goal) * 100}%`, background: done ? '#22c55e' : '#60a5fa', borderRadius: 3, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: done ? '#86efac' : '#fff8', fontFamily: "'Titan One', cursive", minWidth: 32, textAlign: 'right' }}>
                      {done ? '✓' : `${prog}/${c.goal}`}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Achievements quick-access */}
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
          <button
            style={{ ...bigBtn('#6366f1', '#a5b4fc'), width: 300, padding: '10px 10px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onClick={onAchievements}
          >
            🏅 Achievements ({Object.keys(save.unlockedBadges || {}).filter(k => k.startsWith('ach-')).length}/{ACHIEVEMENTS.length})
          </button>
        </div>

        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <button
            style={{ ...bigBtn('#0ea5e9', '#67e8f9'), width: 300, padding: '10px 10px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onClick={onDailyChallenges}
          >
            📅 Daily Challenges
          </button>
        </div>

        {/* Active skin indicator */}
        {save.activeSkin && save.activeSkin !== 'classic' && (
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: '#fcd34d', fontFamily: "'Baloo 2', cursive", opacity: 0.85 }}>
            {BALLOON_SKINS.find(s => s.id === save.activeSkin)?.label || ''} skin active ✨
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementsScreen({ onBack, save }) {
  const unlockedBadges = save.unlockedBadges || {};
  return (
    <div style={screenShell(0)}>
      <WorldBackdrop worldIdx={0} />
      <div style={uiLayer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>← Back</button>
          <div style={{ ...levelBadge, display: 'flex', gap: 5, alignItems: 'center' }}>
            🏅 {Object.keys(unlockedBadges).filter(k => k.startsWith('ach-')).length}/{ACHIEVEMENTS.length}
          </div>
        </div>
        <h2 style={{ ...screenTitle, marginBottom: 8 }}>Achievements</h2>
        <div style={{ padding: '0 12px', display: 'grid', gap: 8, maxHeight: 580, overflowY: 'auto' }}>
          {ACHIEVEMENTS.map((ach) => {
            const earned = !!unlockedBadges[`ach-${ach.id}`];
            return (
              <div
                key={ach.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 14,
                  background: earned
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.28), rgba(253,224,71,0.1))'
                    : 'rgba(255,255,255,0.07)',
                  border: `2px solid ${earned ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.15)'}`,
                  filter: earned ? 'none' : 'grayscale(0.6)',
                  opacity: earned ? 1 : 0.7,
                }}
              >
                <span style={{ fontSize: 28, flexShrink: 0 }}>{ach.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 15, color: earned ? '#fcd34d' : '#fff', lineHeight: 1.1 }}>{ach.label}</div>
                  <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 12, color: '#fff8', marginTop: 2 }}>{ach.desc}</div>
                </div>
                {earned && <span style={{ fontSize: 18 }}>✓</span>}
              </div>
            );
          })}
        </div>
        {/* Skin unlocks */}
        <div style={{ padding: '10px 12px 0', marginTop: 4 }}>
          <div style={{ fontFamily: "'Chewy', cursive", fontSize: 11, color: '#93c5fd', letterSpacing: 3, textAlign: 'center', marginBottom: 6 }}>
            — BALLOON SKINS —
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {BALLOON_SKINS.map((skin) => {
              const skinUnlocked = save.totalStars >= skin.starsNeeded;
              const isActive = save.activeSkin === skin.id;
              return (
                <div
                  key={skin.id}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 12,
                    textAlign: 'center',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.32), rgba(253,224,71,0.15))'
                      : skinUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${isActive ? 'rgba(251,191,36,0.7)' : skinUnlocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                    filter: skinUnlocked ? 'none' : 'grayscale(0.8)',
                    opacity: skinUnlocked ? 1 : 0.55,
                  }}
                >
                  <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 13, color: isActive ? '#fcd34d' : '#fff', lineHeight: 1.1 }}>{skin.label}</div>
                  <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 10, color: '#fff7', marginTop: 2 }}>
                    {skinUnlocked ? (isActive ? 'Active ✨' : skin.desc) : `🔒 ${skin.starsNeeded}⭐`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyChallengesScreen({ onBack, save }) {
  const challenges = Array.isArray(save.dailyChallenges) ? save.dailyChallenges : [];
  const progress = save.dailyProgress || {};
  const doneCount = challenges.filter((c) => (progress[c.type] || 0) >= c.goal).length;
  return (
    <div style={screenShell(1)}>
      <WorldBackdrop worldIdx={1} />
      <div style={uiLayer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>← Back</button>
          <div style={{ ...levelBadge, display: 'flex', gap: 5, alignItems: 'center' }}>
            📅 {save.dailyDate || getDailyDate()}
          </div>
        </div>
        <h2 style={{ ...screenTitle, marginBottom: 8 }}>Daily Challenges</h2>
        <div style={{ ...hud, width: 338, marginInline: 'auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Chewy', cursive", color: '#93c5fd', letterSpacing: 2, fontSize: 13 }}>
            COMPLETE ALL 3 FOR A PERFECT DAY
          </div>
          <div style={{ marginTop: 4, color: '#fff', opacity: 0.9 }}>
            {doneCount}/3 completed
          </div>
        </div>
        <div style={{ padding: '10px 12px 0', display: 'grid', gap: 10 }}>
          {challenges.map((c, idx) => {
            const value = Math.min(progress[c.type] || 0, c.goal);
            const done = value >= c.goal;
            return (
              <div
                key={c.id}
                style={{
                  ...hud,
                  borderRadius: 16,
                  background: done
                    ? 'linear-gradient(145deg, rgba(34,197,94,0.25), rgba(134,239,172,0.12))'
                    : 'linear-gradient(145deg, rgba(59,130,246,0.22), rgba(186,230,253,0.08))',
                  border: `2px solid ${done ? 'rgba(134,239,172,0.65)' : 'rgba(147,197,253,0.55)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28, width: 34, textAlign: 'center' }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 18, color: '#fff', lineHeight: 1.05 }}>
                      {idx + 1}. {c.label}
                    </div>
                    <div style={{ marginTop: 7, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                      <div style={{ width: `${(value / c.goal) * 100}%`, height: '100%', background: done ? '#22c55e' : '#60a5fa', transition: 'width 220ms ease' }} />
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Titan One', cursive", color: done ? '#86efac' : '#e2e8f0', fontSize: 14 }}>
                    {done ? 'DONE' : `${value}/${c.goal}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorldCompleteScreen({ worldName, palette, onContinue }) {
  return (
    <div
      style={{
        ...screenShell(0),
        background: `linear-gradient(160deg, ${palette.top} 0%, ${palette.mid} 55%, ${palette.bot} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'bounce-in 0.55s ease-out both',
      }}
    >
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 17) % 96 + 2}%`,
            top: -8,
            width: 8 + (i % 5),
            height: 10,
            borderRadius: 3,
            background: ['#ffd93d', '#ff8fb1', '#7dd3fc', '#86efac', '#f0abfc'][i % 5],
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (14 + i * 5)}deg)`,
            animation: `confetti-fall ${1.4 + (i % 5) * 0.2}s ${0.1 + i * 0.04}s ease-out both`,
            pointerEvents: 'none',
          }}
        />
      ))}
      <div style={{ textAlign: 'center', padding: 24, zIndex: 2 }}>
        <div style={{ fontSize: 64, lineHeight: 1, animation: 'bob 1.4s ease-in-out infinite', marginBottom: 12 }}>🏆</div>
        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 34, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.3)', lineHeight: 1.1, marginBottom: 6 }}>
          WORLD COMPLETE!
        </div>
        <div style={{ fontFamily: "'Chewy', cursive", fontSize: 22, color: '#fcd34d', letterSpacing: 2, textShadow: '0 2px 0 rgba(0,0,0,0.3)', marginBottom: 18 }}>
          {worldName} Cleared!
        </div>
        <button
          style={{ ...bigBtn('#fbbf24', '#fde68a'), width: 240, fontSize: 20, letterSpacing: 1 }}
          onClick={onContinue}
        >
          Continue ›
        </button>
      </div>
    </div>
  );
}

function WorldSelectScreen({ onBack, onPickWorld, save }) {
  const bgWorldIdx = Math.min(6, Math.floor(save.totalStars / 45));
  return (
    <div style={screenShell(bgWorldIdx)}>
      <WorldBackdrop worldIdx={bgWorldIdx} />
      <div style={uiLayer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>← Back</button>
          <div style={{ ...levelBadge, display: 'flex', gap: 5, alignItems: 'center' }}><IconStar size={15} /> {save.totalStars}</div>
        </div>

        <h2 style={{ ...screenTitle, marginBottom: 6 }}>Choose Kingdom</h2>

        <div style={{ padding: '0 12px', display: 'grid', gap: 10, maxHeight: 568, overflowY: 'auto' }}>
          {WORLDS.map((w) => {
            const meta = WORLD_META[w.idx];
            const unlocked = save.totalStars >= w.unlockStars;
            const worldStars = Array.from({ length: 15 }, (_, i) => save.starsByLevel[`${w.idx}-${i}`] || 0)
              .reduce((a, b) => a + b, 0);
            return (
              <button
                key={w.idx}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  border: `2px solid ${unlocked ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 22,
                  padding: 0,
                  cursor: unlocked ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'stretch',
                  minHeight: 86,
                  filter: unlocked ? 'none' : 'grayscale(0.75)',
                  opacity: unlocked ? 1 : 0.62,
                  boxShadow: unlocked
                    ? `0 6px 0 rgba(0,0,0,0.25), 0 8px 22px ${w.palette.top}66, inset 0 1px 0 rgba(255,255,255,0.4)`
                    : '0 3px 0 rgba(0,0,0,0.15)',
                  textAlign: 'left',
                  fontFamily: "'Lilita One', cursive",
                  color: '#fff',
                  background: `linear-gradient(135deg, ${w.palette.top} 0%, ${w.palette.mid} 55%, ${w.palette.bot} 100%)`,
                }}
                onClick={() => unlocked && onPickWorld(w.idx)}
              >
                {/* Left kingdom icon column */}
                <div
                  style={{
                    width: 76,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.22)',
                    borderRight: '1px solid rgba(255,255,255,0.22)',
                    flexShrink: 0,
                    gap: 2,
                  }}
                >
                  <div style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><meta.icon size={34} /></div>
                  <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1 }}>W{w.idx + 1}</div>
                </div>

                {/* Info column */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 19, textShadow: '0 2px 0 rgba(0,0,0,0.4)', lineHeight: 1 }}>{w.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.82, fontFamily: "'Baloo 2', cursive", marginTop: 3, lineHeight: 1.2 }}>
                    {meta.tagline}
                  </div>
                  <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {unlocked ? (
                      <>
                        <span style={{ fontSize: 12, background: 'rgba(0,0,0,0.26)', borderRadius: 8, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <IconStar size={12} /> {worldStars}/45
                        </span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>Lvl {w.idx * 15 + 1}–{w.idx * 15 + 15}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, background: 'rgba(0,0,0,0.28)', borderRadius: 8, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconLock size={14} /> Needs {w.unlockStars} <IconStar size={12} />
                      </span>
                    )}
                  </div>
                  {!unlocked && (
                    <div style={{ fontSize: 11, fontFamily: "'Baloo 2', cursive", color: '#fcd34da8', marginTop: 3, fontStyle: 'italic', lineHeight: 1.2 }}>
                      {meta.tagline}
                    </div>
                  )}
                </div>

                {/* Floating mini balloon decorations (unlocked only) */}
                {unlocked && meta.balloonColors.map((bc, bi) => (
                  <div
                    key={bi}
                    style={{
                      position: 'absolute',
                      right: 10 + bi * 19,
                      top: -20,
                      width: 13,
                      opacity: 0.55,
                      animation: `bob ${2.2 + bi * 0.5}s ${bi * 0.35}s ease-in-out infinite`,
                      pointerEvents: 'none',
                    }}
                  >
                    <DecoBalloon color={bc} size={13} />
                  </div>
                ))}

                {/* Lock badge */}
                {!unlocked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 18,
                      fontSize: 26,
                      pointerEvents: 'none',
                    }}
                  >
                    <IconLock size={28} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LevelSelectScreen({ worldIdx, save, onBack, onPickLevel }) {
  const world = WORLDS[worldIdx];
  const meta = WORLD_META[worldIdx];
  const levels = ALL_LEVELS.filter((l) => l.worldIdx === worldIdx);
  const worldStars = levels.reduce(
    (sum, lvl) => sum + (save.starsByLevel[`${lvl.worldIdx}-${lvl.levelIdx}`] || 0),
    0,
  );

  // Static background deco balloons (positioned away from tiles)
  const DECO = [
    { left: 10,  top: 100, color: world.palette.top, size: 30, dur: 6.5, delay: 0   },
    { left: 346, top: 136, color: world.palette.mid, size: 24, dur: 7.4, delay: 1.1 },
    { left: 16,  top: 440, color: world.palette.bot, size: 26, dur: 8.0, delay: 2.4 },
    { left: 354, top: 510, color: world.palette.top, size: 20, dur: 6.8, delay: 0.7 },
  ];

  return (
    <div style={screenShell(worldIdx)}>
      <WorldBackdrop worldIdx={worldIdx} />

      {/* Background deco balloons */}
      {DECO.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.left,
            top: d.top,
            width: d.size,
            zIndex: 2,
            opacity: 0.38,
            animation: `bob ${d.dur}s ${d.delay}s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        >
          <DecoBalloon color={d.color} size={d.size} />
        </div>
      ))}

      <div style={{ ...uiLayer, zIndex: 5 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>← Worlds</button>
          <div style={{ ...levelBadge, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}><meta.icon size={20} /> {world.name}</div>
        </div>

        {/* Kingdom tagline + star progress */}
        <div style={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              fontFamily: "'Chewy', cursive",
              fontSize: 12,
              letterSpacing: 3,
              color: 'rgba(255,255,255,0.72)',
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 10,
              padding: '3px 14px',
            }}
          >
            {meta.tagline.toUpperCase()} · ★ {worldStars}/45
          </div>
        </div>

        {/* Level grid */}
        <div style={{ padding: '4px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
          {levels.map((lvl) => {
            const key = `${lvl.worldIdx}-${lvl.levelIdx}`;
            const stars = save.starsByLevel[key] || 0;
            const best = save.bestScoreByLevel[key] || 0;
            const [c1, c2] = LEVEL_TYPE_COLORS[lvl.type] || LEVEL_TYPE_COLORS.Normal;
            const TypeIcon = LEVEL_TYPE_ICONS[lvl.type] || IconBalloon;
            return (
              <button
                key={lvl.id}
                style={{
                  ...smallBtn,
                  minHeight: 100,
                  background: `linear-gradient(160deg, ${c1}, ${c2})`,
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  border: stars === 3
                    ? '2px solid rgba(255,215,60,0.9)'
                    : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: stars === 3
                    ? '0 4px 0 rgba(0,0,0,0.2), 0 0 14px rgba(255,215,60,0.38)'
                    : '0 4px 0 rgba(0,0,0,0.2)',
                }}
                onClick={() => onPickLevel(lvl)}
              >
                <div style={{ lineHeight: 1 }}><TypeIcon size={22} /></div>
                <div style={{ fontSize: 22, fontFamily: "'Titan One', cursive", lineHeight: 1 }}>{lvl.displayNum}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0, 1, 2].map((si) => (
                    <span key={si} style={{ opacity: si < stars ? 1 : 0.22, display: 'inline-flex' }}><IconStar size={12} /></span>
                  ))}
                </div>
                {best > 0 && (
                  <div style={{ fontSize: 10, opacity: 0.75, fontFamily: "'Baloo 2', cursive" }}>{best}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorldIntroScreen({ worldIdx, onContinue }) {
  const world = WORLDS[worldIdx];
  return (
    <div style={screenShell(worldIdx)}>
      <WorldBackdrop worldIdx={worldIdx} />
      <div style={{ ...uiLayer, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 24 }}>
        <div style={{ ...hud, width: '100%', maxWidth: 332 }}>
          <h2 style={{ margin: 0, ...screenTitle, marginTop: 0 }}>{world.name}</h2>
          <p
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: 21,
              color: '#fff',
              textShadow: '0 2px 0 rgba(0,0,0,0.35)',
              lineHeight: 1.25,
              margin: '10px 0 0',
            }}
          >
            {world.intro}
          </p>
          <button style={{ ...bigBtn('#4D96FF', '#89d2ff'), marginTop: 20 }} onClick={onContinue}>Enter World</button>
        </div>
      </div>
    </div>
  );
}

function LevelCompleteScreen({ level, result, onRetry, onNext, onWorlds }) {
  const world = WORLDS[level.worldIdx] || WORLDS[0];
  const titleColor = '#2f63c9';
  const isNewPB = result.score > (result.prevBest || 0);
  const accentBalloons = WORLD_META[level.worldIdx]?.balloonColors || [world.palette.top, world.palette.mid, world.palette.bot];
  const [accent1, accent2, accent3] = accentBalloons;
  const backdropBalloons = [
    { left: '8%',  bottom: '-68px', size: 38, dur: 10.5, delay: 0.2, color: accentBalloons[0] },
    { left: '24%', bottom: '-54px', size: 30, dur: 9.4,  delay: 1.2, color: accentBalloons[1] },
    { left: '72%', bottom: '-74px', size: 42, dur: 11.3, delay: 0.8, color: accentBalloons[2] },
    { left: '88%', bottom: '-58px', size: 34, dur: 9.9,  delay: 2.1, color: accentBalloons[0] },
  ];
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const handleShare = () => {
    navigator.share({
      title: 'Balloon Pop: Sky Kingdom',
      text: `I scored ${result.score} on ${level.name} Level ${level.displayNum} — ${result.stars}⭐! Can you beat it? 🎈`,
      url: window.location.href,
    }).catch(() => {});
  };

  return (
    <div style={screenShell(level.worldIdx)}>
      <WorldBackdrop worldIdx={level.worldIdx} />

      {/* Sky Kingdom backdrop motif */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 78,
            transform: 'translateX(-50%)',
            width: 220,
            height: 120,
            opacity: 0.38,
            animation: 'bob 5.2s ease-in-out infinite',
            filter: `drop-shadow(0 10px 18px ${world.palette.top}44)`,
          }}
        >
          <svg viewBox="0 0 220 120" width="220" height="120" aria-hidden="true">
            <defs>
              <linearGradient id="castleStone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent2} stopOpacity="0.9" />
                <stop offset="100%" stopColor={world.palette.mid} stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="castleRoof" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={accent1} stopOpacity="0.95" />
                <stop offset="100%" stopColor={accent3} stopOpacity="0.78" />
              </linearGradient>
              <linearGradient id="cloudFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={world.palette.top} stopOpacity="0.68" />
                <stop offset="100%" stopColor={world.palette.mid} stopOpacity="0.46" />
              </linearGradient>
            </defs>

            {/* Back clouds */}
            <ellipse cx="78" cy="84" rx="36" ry="14" fill={world.palette.top} fillOpacity="0.44" />
            <ellipse cx="146" cy="82" rx="34" ry="13" fill={world.palette.mid} fillOpacity="0.4" />

            {/* Main keep and towers */}
            <g fill="url(#castleStone)" stroke={world.palette.bot} strokeOpacity="0.55" strokeWidth="1">
              <rect x="72" y="46" width="76" height="34" rx="3" />
              <rect x="58" y="40" width="18" height="40" rx="2" />
              <rect x="144" y="40" width="18" height="40" rx="2" />
              <rect x="99" y="34" width="22" height="46" rx="2" />
            </g>

            {/* Battlements */}
            <g fill={world.palette.bot} fillOpacity="0.72">
              <rect x="58" y="36" width="4" height="5" />
              <rect x="66" y="36" width="4" height="5" />
              <rect x="72" y="42" width="5" height="5" />
              <rect x="82" y="42" width="5" height="5" />
              <rect x="92" y="42" width="5" height="5" />
              <rect x="102" y="30" width="5" height="5" />
              <rect x="112" y="30" width="5" height="5" />
              <rect x="122" y="42" width="5" height="5" />
              <rect x="132" y="42" width="5" height="5" />
              <rect x="142" y="42" width="5" height="5" />
              <rect x="148" y="36" width="4" height="5" />
              <rect x="156" y="36" width="4" height="5" />
            </g>

            {/* Roofs and flags */}
            <path d="M54 40 L67 27 L80 40 Z" fill="url(#castleRoof)" />
            <path d="M95 34 L110 18 L125 34 Z" fill="url(#castleRoof)" />
            <path d="M140 40 L153 27 L166 40 Z" fill="url(#castleRoof)" />
            <line x1="67" y1="27" x2="67" y2="22" stroke={world.palette.bot} strokeOpacity="0.75" strokeWidth="1.2" />
            <line x1="110" y1="18" x2="110" y2="12" stroke={world.palette.bot} strokeOpacity="0.8" strokeWidth="1.2" />
            <line x1="153" y1="27" x2="153" y2="22" stroke={world.palette.bot} strokeOpacity="0.75" strokeWidth="1.2" />
            <path d="M67 22 L74 24 L67 27 Z" fill={accent1} fillOpacity="0.88" />
            <path d="M110 12 L118 14 L110 18 Z" fill={accent2} fillOpacity="0.9" />
            <path d="M153 22 L160 24 L153 27 Z" fill={accent3} fillOpacity="0.88" />

            {/* Windows + gate */}
            <g fill={world.palette.bot} fillOpacity="0.48">
              <rect x="64" y="52" width="4" height="7" rx="1.5" />
              <rect x="152" y="52" width="4" height="7" rx="1.5" />
              <rect x="84" y="54" width="4" height="6" rx="1.5" />
              <rect x="132" y="54" width="4" height="6" rx="1.5" />
              <rect x="106" y="42" width="6" height="8" rx="2" />
            </g>
            <path d="M104 80 L104 69 A6 6 0 0 1 116 69 L116 80 Z" fill={world.palette.bot} fillOpacity="0.55" />

            {/* Front clouds */}
            <ellipse cx="64" cy="92" rx="44" ry="17" fill="url(#cloudFront)" />
            <ellipse cx="112" cy="95" rx="54" ry="20" fill="url(#cloudFront)" />
            <ellipse cx="160" cy="90" rx="42" ry="16" fill="url(#cloudFront)" />
          </svg>
        </div>

        {backdropBalloons.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.left,
              bottom: b.bottom,
              width: b.size,
              opacity: 0.36,
              animation: `home-balloon-rise ${b.dur}s ${b.delay}s linear infinite`,
              filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.2))',
            }}
          >
            <DecoBalloon color={b.color} size={b.size} />
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 62,
            height: 126,
            background: `linear-gradient(180deg, ${world.palette.mid}33 0%, ${world.palette.bot}66 100%)`,
            border: `1px solid ${world.palette.top}55`,
            clipPath:
              'polygon(0 100%,0 60%,8% 60%,8% 38%,14% 38%,14% 60%,22% 60%,22% 46%,28% 46%,28% 60%,36% 60%,36% 34%,42% 34%,42% 60%,50% 60%,50% 28%,56% 28%,56% 60%,64% 60%,64% 40%,70% 40%,70% 60%,78% 60%,78% 34%,84% 34%,84% 60%,92% 60%,92% 44%,97% 44%,97% 60%,100% 60%,100% 100%)',
            borderRadius: 10,
            boxShadow: `0 0 24px ${world.palette.top}44`,
          }}
        />
      </div>

      <div style={{ ...uiLayer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...hud, width: 334, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {isNewPB && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(circle at 50% 8%, rgba(251,191,36,0.42), transparent 55%)',
                animation: 'pb-flash 0.9s ease-out',
                zIndex: 0,
              }}
            />
          )}
          {Array.from({ length: result.stars * 7 + (result.newWorldBadge ? 12 : 0) + (isNewPB ? 16 : 0) }).map((_, i) => (
            <span
              key={`c-${i}`}
              style={{
                position: 'absolute',
                left: `${(i * 17) % 96 + 2}%`,
                top: -8,
                width: 7 + (i % 4),
                height: 9,
                borderRadius: 2,
                background: ['#ffd93d', '#ff8fb1', '#7dd3fc', '#86efac', '#f0abfc'][i % 5],
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (12 + i * 6)}deg)`,
                animation: `confetti-fall ${1.2 + (i % 5) * 0.2}s ${0.14 + i * 0.03}s ease-out both`,
                pointerEvents: 'none',
                opacity: 0.95,
              }}
            />
          ))}
          <h2
            style={{
              ...screenTitle,
              marginTop: 0,
              marginBottom: 12,
              lineHeight: 1.02,
              fontFamily: "'Lilita One', cursive",
              fontSize: 42,
              letterSpacing: 1,
              transform: 'rotate(-0.8deg)',
              background: 'transparent',
              color: titleColor,
              WebkitTextStroke: '1.8px rgba(255,255,255,0.9)',
              textShadow: `0 3px 0 rgba(0,0,0,0.28), 0 0 20px ${world.palette.mid}99, 0 0 26px ${world.palette.top}66`,
              animation: 'pulse-slow 1.3s ease-in-out infinite alternate',
            }}
          >
            {isNewPB ? 'New Record!' : 'Level Complete!'}
          </h2>
          <div style={{ ...levelBadge, width: 220, marginInline: 'auto', marginTop: 2 }}>Level {level.displayNum} - {level.type}</div>
          
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 18, fontFamily: "'Titan One', cursive", color: '#fff' }}>
              {result.score}
              {isNewPB && (
                <span style={{ fontSize: 14, color: '#fbbf24', marginLeft: 8, fontFamily: "'Lilita One', cursive" }}>
                  +{result.score - (result.prevBest || 0)} NEW RECORD
                </span>
              )}
            </div>
            {result.prevBest && result.score <= result.prevBest && (
              <div style={{ marginTop: 4, fontSize: 13, color: '#fff8', fontFamily: "'Baloo 2', cursive" }}>
                Personal Best: {result.prevBest}
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, color: '#fff' }}>
            <div style={{ background: 'rgba(96,165,250,0.2)', padding: '6px 8px', borderRadius: 8 }}>
              Popped: {result.popCount}/{level.goal}
            </div>
            <div style={{ background: 'rgba(251,146,60,0.2)', padding: '6px 8px', borderRadius: 8 }}>
              Accuracy: {result.accuracy.toFixed(1)}%
            </div>
          </div>

          <Stars count={result.stars} />

          {/* Star Progression Indicator */}
          <div style={{ marginTop: 10, display: 'flex', gap: 4, justifyContent: 'center', fontSize: 12, color: '#fff' }}>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: result.stars >= 1 ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${result.stars >= 1 ? '#fcd34d' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              ⭐ Clear
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: result.stars >= 2 ? 'linear-gradient(135deg,#60a5fa,#3b82f6)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${result.stars >= 2 ? '#93c5fd' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              ⭐ Score
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: result.stars >= 3 ? 'linear-gradient(135deg,#a78bfa,#8b5cf6)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${result.stars >= 3 ? '#d8b4fe' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              ⭐ Mastery
            </div>
          </div>

          {result.newTitleUnlocked && (
            <div style={{ ...levelBadge, width: 240, marginInline: 'auto', marginTop: 8, background: 'linear-gradient(135deg,#f59e0b,#fde68a)' }}>
              New Title: {result.newTitleUnlocked}
            </div>
          )}
          {result.newWorldBadge && (
            <div style={{ ...levelBadge, width: 252, marginInline: 'auto', marginTop: 6, background: 'linear-gradient(135deg,#22d3ee,#60a5fa)' }}>
              Badge Earned: {result.newWorldBadge} Clear
            </div>
          )}
          {Array.isArray(result.newAchievements) && result.newAchievements.length > 0 && (
            <div style={{ ...levelBadge, width: 270, marginInline: 'auto', marginTop: 6, background: 'linear-gradient(135deg,#f59e0b,#fcd34d)' }}>
              New Achievement{result.newAchievements.length > 1 ? 's' : ''}: {result.newAchievements.length}
            </div>
          )}
          <div style={{ marginTop: 6, fontSize: 13, color: '#fffa', fontFamily: "'Baloo 2', cursive" }}>{level.masteryLabel}</div>

          <div style={{ marginTop: 18, display: 'grid', gap: 10, justifyItems: 'center' }}>
            <button
              style={{
                ...bigBtn('#3b82f6', '#8fd3ff'),
                width: 294,
                fontSize: 22,
                letterSpacing: 1.4,
                border: '3px solid rgba(255,255,255,0.75)',
                boxShadow: '0 7px 0 rgba(0,0,0,0.24), 0 0 22px rgba(77,150,255,0.65), inset 0 2px 0 rgba(255,255,255,0.7)',
                animation: 'pulse-slow 1.1s ease-in-out infinite alternate',
              }}
              onClick={onNext}
            >
              Next Level
            </button>
            <button
              style={{
                ...bigBtn('#10b981', '#86efcf'),
                width: 192,
                padding: '10px 20px',
                fontSize: 16,
                letterSpacing: 0.8,
                border: '3px solid rgba(255,255,255,0.68)',
                boxShadow: '0 6px 0 rgba(0,0,0,0.22), 0 0 18px rgba(16,185,129,0.55), inset 0 2px 0 rgba(255,255,255,0.66)',
              }}
              onClick={onRetry}
            >
              Retry
            </button>
            {canShare && (
              <button style={bigBtn('#FF9F43', '#ffd278')} onClick={handleShare}>Share Score 📤</button>
            )}
            <button
              style={{
                ...bigBtn('#7c3aed', '#c084fc'),
                width: 192,
                padding: '10px 20px',
                fontSize: 16,
                letterSpacing: 0.8,
                opacity: 0.95,
              }}
              onClick={onWorlds}
            >
              World Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelFailedScreen({ level, result, onRetry, onWorlds }) {
  const needed = level.goal - result.popCount;
  const percentClose = (result.popCount / level.goal) * 100;
  const isVeryClose = needed <= 2;
  const isClose = needed <= 5;
  const timeoutLoss = level.time && result.taps > 0;
  const lowAccuracy = result.accuracy && result.accuracy < 45;
  const tooManyEscapes = result.escapes >= 8;

  let encouragement = '';
  let reason = '';
  let tip = '';

  if (isVeryClose) {
    encouragement = `SO CLOSE! Just ${needed} more pop${needed === 1 ? '' : 's'}!`;
    tip = '💡 Next time focus on rapid taps—you had the skill!';
  } else if (isClose) {
    encouragement = `Almost there! You're ${Math.round(percentClose)}% done!`;
    tip = '💡 Build your combos faster to rack up points quicker.';
  } else {
    encouragement = 'Keep practicing! You\'ll get it next time!';
    tip = '';
  }

  if (tooManyEscapes) reason = '🎈 Too many balloons escaped—catch them before they float away!';
  else if (timeoutLoss) reason = '⏰ Time ran out—try a faster strategy!';
  else if (lowAccuracy) reason = '🎯 Accuracy was low—be more selective with your taps!';
  else if (needed > 0) reason = `${needed} more pop${needed === 1 ? '' : 's'} needed to clear.`;

  const progressWidth = Math.min(percentClose, 100);

  return (
    <div style={screenShell(level.worldIdx)}>
      <WorldBackdrop worldIdx={level.worldIdx} />
      <div style={{ ...uiLayer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...hud, width: 332, textAlign: 'center' }}>
          <h2 style={screenTitle}>Level Failed</h2>
          <div style={{ ...levelBadge, width: 240, marginInline: 'auto' }}>Level {level.displayNum} — {level.type}</div>

          {/* Progress bar visualization */}
          <div style={{ marginTop: 14, marginInline: 'auto' }}>
            <div style={{ fontSize: 12, color: '#fffa', marginBottom: 6, fontFamily: "'Baloo 2', cursive" }}>
              {result.popCount} / {level.goal} POPS
            </div>
            <div
              style={{
                width: '100%',
                height: 20,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.35)',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  width: `${progressWidth}%`,
                  height: '100%',
                  background: isVeryClose
                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                    : isClose
                      ? 'linear-gradient(90deg, #60a5fa, #3b82f6)'
                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  transition: 'width 0.6s ease-out',
                  boxShadow: isVeryClose ? '0 0 12px rgba(251,191,36,0.8)' : 'none',
                }}
              />
            </div>
          </div>

          {/* Encouragement message */}
          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              fontWeight: 'bold',
              color: isVeryClose ? '#fbbf24' : isClose ? '#60a5fa' : '#fff',
              fontFamily: "'Lilita One', cursive",
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
              letterSpacing: 0.5,
            }}
          >
            {encouragement}
          </div>

          {/* Reason for failure */}
          {reason && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#fff8', fontFamily: "'Baloo 2', cursive" }}>
              {reason}
            </div>
          )}

          {/* Performance stats */}
          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              fontSize: 13,
              color: '#fff',
            }}
          >
            <div style={{ background: 'rgba(96,165,250,0.2)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(96,165,250,0.4)' }}
            >
              Accuracy: {result.accuracy.toFixed(0)}%
            </div>
            <div style={{ background: 'rgba(251,146,60,0.2)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(251,146,60,0.4)' }}>
              Max Combo: {result.maxCombo}x
            </div>
            <div style={{ background: 'rgba(239,68,68,0.2)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)' }}>
              Escapes: {result.escapes}
            </div>
            <div style={{ background: 'rgba(168,85,247,0.2)', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.4)' }}>
              Score: {result.score}
            </div>
          </div>

          {/* Tip */}
          {tip && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#fef3c7', fontFamily: "'Baloo 2', cursive", fontStyle: 'italic' }}>
              {tip}
            </div>
          )}

          <div style={{ marginTop: 18, display: 'grid', gap: 10, justifyItems: 'center' }}>
            <button
              style={{
                ...bigBtn('#16a34a', '#86efac'),
                width: 280,
                padding: '13px 26px',
                fontSize: 22,
                letterSpacing: 1.4,
                border: '3px solid rgba(255,255,255,0.68)',
                boxShadow: '0 7px 0 rgba(0,0,0,0.24), 0 0 20px rgba(22,163,74,0.58), inset 0 2px 0 rgba(255,255,255,0.72)',
                animation: 'pulse-slow 1.2s ease-in-out infinite alternate',
              }}
              onClick={onRetry}
            >
              GO RETRY
            </button>
            <button
              style={{
                ...bigBtn('#7c3aed', '#c084fc'),
                width: 192,
                padding: '10px 20px',
                fontSize: 16,
                letterSpacing: 0.8,
                opacity: 0.95,
              }}
              onClick={onWorlds}
            >
              World Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SurvivalEndScreen({ result, onReplay, onHome }) {
  const elapsed = result?.elapsed ?? 0;
  const score = result?.score ?? 0;
  const popCount = result?.popCount ?? 0;
  const maxCombo = result?.maxCombo ?? 0;
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const handleShare = () => {
    navigator.share({
      title: 'Balloon Pop: Sky Kingdom',
      text: `I survived ${elapsed.toFixed(1)}s and scored ${score} in Survival mode! 🎈 Can you beat it?`,
      url: window.location.href,
    }).catch(() => {});
  };

  return (
    <div style={screenShell(5)}>
      <WorldBackdrop worldIdx={5} />
      <div style={{ ...uiLayer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...hud, width: 332, textAlign: 'center' }}>
          <h2 style={screenTitle}>Survival Ended</h2>
          <div style={{ ...levelBadge, width: 220, marginInline: 'auto' }}>Time {elapsed.toFixed(1)}s</div>
          <div style={{ marginTop: 10, color: '#fff', fontSize: 20 }}>Score {score}</div>
          <div style={{ marginTop: 4, color: '#fff', fontSize: 15 }}>Pops {popCount}</div>
          <div style={{ marginTop: 4, color: '#fff', fontSize: 15 }}>Max Combo {maxCombo}x</div>
          <div style={{ marginTop: 18, display: 'grid', gap: 10, justifyItems: 'center' }}>
            <button style={bigBtn('#FF9F43', '#ffd278')} onClick={onReplay}>Play Again</button>
            {canShare && (
              <button style={bigBtn('#4D96FF', '#87d1ff')} onClick={handleShare}>Share Score 📤</button>
            )}
            <button style={bigBtn('#4D96FF', '#87d1ff')} onClick={onHome}>Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VictoryScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={screenShell(6)}>
      <WorldBackdrop worldIdx={6} />
      <div style={{ ...uiLayer, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...hud, width: 334, textAlign: 'center', animation: 'bounce-in 0.7s ease-out both' }}>
          <div style={{ fontSize: 54, marginBottom: 8 }}>👑</div>
          <h2 style={screenTitle}>Sky Kingdom Saved!</h2>
          <p style={{ ...creditLine, textAlign: 'center' }}>
            You cleared all 105 campaign levels.
          </p>
          <p style={{ ...creditLine, textAlign: 'center', fontSize: 18 }}>
            Returning to home...
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ save, setSave, onBack }) {
  const settings = { ...DEFAULT_SAVE.settings, ...(save.settings || {}) };
  const unlockedSkinIds = BALLOON_SKINS.filter((s) => (save.totalStars || 0) >= s.starsNeeded).map((s) => s.id);
  const setSetting = (key, value) => {
    const next = {
      ...save,
      settings: { ...settings, [key]: value },
    };
    writeSave(next);
    setSave(next);
  };

  const rows = [
    { key: 'sound', label: 'Sound' },
    { key: 'ambient', label: 'Ambient Music' },
    { key: 'haptics', label: 'Haptics' },
    { key: 'reduceShake', label: 'Reduce Shake' },
    { key: 'reduceFlash', label: 'Reduce Flash' },
    { key: 'colorAssist', label: 'Color Assist' },
    { key: 'largeHud', label: 'Large HUD Text' },
    { key: 'batterySaver', label: 'Battery Saver FX' },
  ];

  return (
    <div style={screenShell(0)}>
      <WorldBackdrop worldIdx={0} />
      <div style={uiLayer}>
        <div style={{ marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>Back</button>
        </div>
        <h2 style={screenTitle}>Settings</h2>
        <div style={{ ...hud, width: 336, marginInline: 'auto', marginTop: 16 }}>
          {rows.map((row) => (
            <div style={settingRow} key={row.key}>
              <span>{row.label}</span>
              <button
                style={{ ...toggleBtn, background: settings[row.key] ? '#22c55e' : '#64748b' }}
                onClick={() => {
                  const nextValue = !settings[row.key];
                  setSetting(row.key, nextValue);
                  if (row.key === 'sound' && nextValue) playSound('pop', true);
                  if (row.key === 'haptics') haptic('button', true);
                }}
              >
                {settings[row.key] ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}

          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 10 }}>
            <div style={{ color: '#fff', fontFamily: "'Chewy', cursive", letterSpacing: 1, marginBottom: 8, fontSize: 18 }}>
              Balloon Skin
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {BALLOON_SKINS.map((skin) => {
                const unlocked = unlockedSkinIds.includes(skin.id);
                const active = save.activeSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked) return;
                      const next = { ...save, activeSkin: skin.id };
                      writeSave(next);
                      setSave(next);
                    }}
                    style={{
                      ...smallBtn,
                      fontSize: 13,
                      padding: '8px 6px',
                      minHeight: 58,
                      opacity: unlocked ? 1 : 0.5,
                      filter: unlocked ? 'none' : 'grayscale(0.7)',
                      border: active ? '2px solid rgba(251,191,36,0.9)' : '2px solid rgba(255,255,255,0.3)',
                      background: active
                        ? 'linear-gradient(135deg,#f59e0b,#fde68a)'
                        : 'linear-gradient(135deg,#475569,#94a3b8)',
                    }}
                  >
                    <div>{skin.label}</div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: 0.9 }}>
                      {unlocked ? (active ? 'ACTIVE' : skin.desc) : `LOCKED • ${skin.starsNeeded}⭐`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreditsScreen({ onBack }) {
  return (
    <div style={screenShell(6)}>
      <WorldBackdrop worldIdx={6} />
      <div style={uiLayer}>
        <div style={{ marginTop: 18, paddingInline: 14 }}>
          <button style={backBtn} onClick={onBack}>Back</button>
        </div>
        <h2 style={screenTitle}>Credits</h2>
        <div style={{ ...hud, width: 334, marginInline: 'auto', marginTop: 20, textAlign: 'left' }}>
          <p style={creditLine}>Game: Balloon Pop: Sky Kingdom</p>
          <p style={creditLine}>Built with React + Vite</p>
          <p style={creditLine}>Fonts: Lilita One, Titan One, Baloo 2, Chewy, Bungee Inline</p>
          <p style={creditLine}>All visuals rendered with CSS + SVG</p>
          <p style={creditLine}>Made for mobile portrait arcade play</p>
        </div>
      </div>
    </div>
  );
}

const TUTORIAL_STEPS = [
  {
    emoji: '🎈',
    title: 'Pop balloons!',
    body: 'Tap any balloon before it floats away. Fill your pop quota before time runs out.',
  },
  {
    emoji: '🔥',
    title: 'Build combos!',
    body: 'Pop balloons rapidly — each one within 2 seconds of the last. 3-in-a-row = 1.5x, 10-in-a-row = 5x, 20-in-a-row = 8x bonus!',
  },
  {
    emoji: '💣',
    title: 'Avoid Bombs!',
    body: 'Black 💣 balloons explode and cost a life. They also blast nearby balloons. Dodge them — they are NOT worth it.',
  },
  {
    emoji: '✨',
    title: 'Special balloons!',
    body: '✨ Golden = 5pts  •  🌈 Rainbow clears the screen  •  ❄ Frozen slows time  •  ⚡💥🧲🛡 Power-ups for huge effects!',
  },
  {
    emoji: '⭐',
    title: 'Earn 3 stars!',
    body: 'Clear the level for 1 star, hit the score threshold for 2, and master the special condition for the third!',
  },
];

function TutorialOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        backdropFilter: 'blur(7px)',
        background: 'rgba(10,8,28,0.58)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          ...hud,
          width: 330,
          textAlign: 'center',
          animation: 'bounce-in 0.45s ease-out both',
        }}
        key={step}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 22 : 10,
                height: 10,
                borderRadius: 99,
                background: i === step ? '#ffd93d' : 'rgba(255,255,255,0.3)',
                transition: 'width 0.2s ease',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>{current.emoji}</div>

        <h2
          style={{
            margin: '0 0 10px',
            fontFamily: "'Bungee Inline', cursive",
            fontSize: 28,
            color: '#fff',
            textShadow: '0 3px 0 rgba(0,0,0,0.35), 0 0 14px rgba(255,255,255,0.22)',
          }}
        >
          {current.title}
        </h2>

        <p
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 18,
            lineHeight: 1.3,
            color: '#e8f0ff',
            margin: '0 0 20px',
            textShadow: '0 1px 0 rgba(0,0,0,0.4)',
          }}
        >
          {current.body}
        </p>

        <button
          style={{ ...bigBtn('#4D96FF', '#87d1ff'), width: 230 }}
          onClick={() => {
            if (isLast) {
              onDone();
            } else {
              setStep((s) => s + 1);
            }
          }}
        >
          {isLast ? "Let's Play! 🚀" : 'Next →'}
        </button>

        {step > 0 && (
          <button
            style={{
              ...smallBtn,
              marginTop: 10,
              width: 100,
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 15,
              boxShadow: 'none',
            }}
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function GameEngine({ mode, level, save, setSave, onResult, onQuit }) {
  const effectiveLevel =
    mode === 'campaign' ? level : mode === 'survival' ? { worldIdx: 6, type: 'Survival' } : { worldIdx: 2, type: 'Zen' };
  const worldIdx = effectiveLevel?.worldIdx ?? 0;
  const settings = save.settings || DEFAULT_SAVE.settings;
  const reduceShake = !!settings.reduceShake;
  const reduceFlash = !!settings.reduceFlash;
  const colorAssist = !!settings.colorAssist;
  const largeHud = !!settings.largeHud;
  const batterySaver = !!settings.batterySaver;
  const ambientEnabled = (settings.ambient ?? true) && settings.sound && !batterySaver;

  const [balloons, setBalloons] = useState([]);
  const [particles, setParticles] = useState([]);
  const [shockwaves, setShockwaves] = useState([]);
  const [shieldZaps, setShieldZaps] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);
  const [floatingCombos, setFloatingCombos] = useState([]);
  const [monkeyFalls, setMonkeyFalls] = useState([]);
  const [birdBursts, setBirdBursts] = useState([]);

  const [score, setScore] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [misses, setMisses] = useState(0);
  const [escapes, setEscapes] = useState(0);
  const [taps, setTaps] = useState(0);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(mode === 'zen' ? 999 : 3);

  const [timeLeft, setTimeLeft] = useState(mode === 'campaign' ? level.time : 9999);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [flashFx, setFlashFx] = useState({ text: '', color: '#fff', ts: 0 });
  const [screenShake, setScreenShake] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [explosiveChainActive, setExplosiveChainActive] = useState(false);
  const [bubbleWaveActive, setBubbleWaveActive] = useState(false);
  const [jackpotActive, setJackpotActive] = useState(false);
  const [precisionFocusActive, setPrecisionFocusActive] = useState(false);
  const [tornadoActive, setTornadoActive] = useState(false);
  const [reflectShieldActive, setReflectShieldActive] = useState(false);
  const [overdrive, setOverdrive] = useState(1);
  const [homingBalloonsCount, setHomingBalloonsCount] = useState(0);
  const [comboFlash, setComboFlash] = useState('');
  const [fireStreak, setFireStreak] = useState(0);

  // Tutorial — shown the very first time a player starts a campaign level
  const isFirstEver = mode === 'campaign' && level?.worldIdx === 0 && level?.levelIdx === 0 && !save.tutorialSeen;
  const [showTutorial, setShowTutorial] = useState(isFirstEver);
  const showTutorialRef = useRef(isFirstEver);

  // rafFrameRef: physics runs every frame; React state updates every 2nd frame (30fps) to reduce re-renders on low-end devices
  const rafFrameRef = useRef(0);
  const balloonsRef = useRef([]);
  const scoreRef = useRef(0);
  const popRef = useRef(0);
  const comboRef = useRef(0);
  const escapesRef = useRef(0);
  const freezeRef = useRef(false);
  const multRef = useRef(false);
  const shieldRef = useRef(false);
  const explosiveChainRef = useRef(false);
  const bubbleWaveRef = useRef(false);
  const precisionFocusRef = useRef(false);
  const tornadoRef = useRef(false);
  const reflectShieldRef = useRef(false);
  const overdriveRef = useRef(1);
  const lastFrameRef = useRef(performance.now());
  const pausedRef = useRef(false);
  const endedRef = useRef(false);
  const windRef = useRef({ x: 0, targetX: rand(-0.2, 0.2), nextChange: performance.now() + rand(3000, 7000), gustStrength: 0 });
  const lastPopAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const fireStreakRef = useRef(0);
  const sessionPopsRef = useRef({ total: 0, heart: 0, unicorn: 0, rainbow: 0, golden: 0 });
  const activePowerupsRef = useRef(new Set());

  // Keep showTutorialRef in sync with state so rAF can read it without closure staleness
  useEffect(() => {
    showTutorialRef.current = showTutorial;
  }, [showTutorial]);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    popRef.current = popCount;
  }, [popCount]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    escapesRef.current = escapes;
  }, [escapes]);

  useEffect(() => {
    freezeRef.current = freezeActive;
  }, [freezeActive]);

  useEffect(() => {
    multRef.current = multiplierActive;
  }, [multiplierActive]);

  useEffect(() => {
    shieldRef.current = shieldActive;
  }, [shieldActive]);

  useEffect(() => {
    explosiveChainRef.current = explosiveChainActive;
  }, [explosiveChainActive]);

  useEffect(() => {
    bubbleWaveRef.current = bubbleWaveActive;
  }, [bubbleWaveActive]);

  useEffect(() => {
    precisionFocusRef.current = precisionFocusActive;
  }, [precisionFocusActive]);

  useEffect(() => {
    tornadoRef.current = tornadoActive;
  }, [tornadoActive]);

  useEffect(() => {
    reflectShieldRef.current = reflectShieldActive;
  }, [reflectShieldActive]);

  useEffect(() => {
    overdriveRef.current = overdrive;
  }, [overdrive]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    startAmbient(worldIdx, ambientEnabled);
    return () => stopAmbient();
  }, [ambientEnabled, worldIdx]);

  const spawnBurst = useCallback((x, y, color, amount = 8) => {
    const scaledCount = Math.max(5, Math.round(amount * (batterySaver ? 0.58 : 1)));
    const confettiColors = [
      color,
      '#ffd93d',
      '#ff8fb1',
      '#7dd3fc',
      '#86efac',
      '#f0abfc',
      '#fb923c',
    ];
    const burst = Array.from({ length: scaledCount }).map((_, i) => ({
      id: uid(),
      x,
      y,
      size: rand(7, 11),
      color: confettiColors[i % confettiColors.length],
      dx: rand(-45, 45),
      dy: rand(-45, 35),
      spin: rand(-210, 210),
      confetti: i % 3 === 0,
      bornAt: performance.now(),
    }));
    setParticles((prev) => [...prev, ...burst]);
  }, [batterySaver]);

  const spawnScoreFx = useCallback((x, y, text, color = '#fff', big = false) => {
    setFloatingScores((prev) => [...prev, { id: uid(), x, y, text, color, bornAt: performance.now(), big }]);
  }, []);

  const spawnComboFx = useCallback((x, y, combo, isNewMilestone = false) => {
    setFloatingCombos((prev) => [...prev, { id: uid(), x, y, combo, bornAt: performance.now(), isMilestone: isNewMilestone }]);
  }, []);

  const spawnMonkeyFallFx = useCallback((x, y) => {
    setMonkeyFalls((prev) => [
      ...prev,
      {
        id: uid(),
        x,
        y,
        bornAt: performance.now(),
        wobble: rand(-12, 12),
        sway: rand(-8, 8),
      },
    ]);
  }, []);

  const spawnBirdBurstFx = useCallback((x, y) => {
    const birdsCount = batterySaver ? 2 : Math.floor(rand(3, 6));
    const birdChoices = ['🐦', '🐤', '🕊️'];
    const burst = Array.from({ length: birdsCount }).map((_, i) => ({
      id: uid(),
      x,
      y,
      bornAt: performance.now(),
      dx: rand(-95, 95),
      dy: rand(-135, -48),
      rot: rand(-38, 38),
      emoji: birdChoices[i % birdChoices.length],
    }));
    setBirdBursts((prev) => [...prev, ...burst]);
  }, [batterySaver]);

  const spawnEmojiBurstFx = useCallback((x, y, emojis) => {
    const count = batterySaver ? 2 : Math.floor(rand(3, 5));
    const burst = Array.from({ length: count }).map((_, i) => ({
      id: uid(),
      x,
      y,
      bornAt: performance.now(),
      dx: rand(-80, 80),
      dy: rand(-110, -40),
      rot: rand(-30, 30),
      emoji: emojis[i % emojis.length],
    }));
    setBirdBursts((prev) => [...prev, ...burst]);
  }, [batterySaver]);

  const showFlash = useCallback((text, color) => {
    if (reduceFlash) return;
    setFlashFx({ text, color, ts: performance.now() });
  }, [reduceFlash]);

  const addShockwave = useCallback((x, y, size = 130, color = 'rgba(255,180,90,0.7)') => {
    setShockwaves((prev) => [...prev, { id: uid(), x, y, size, color, bornAt: performance.now() }]);
  }, []);

  const breakCombo = useCallback(() => {
    setCombo(0);
    comboRef.current = 0;
    setFireStreak(0);
    fireStreakRef.current = 0;
  }, []);

  const addScore = useCallback(
    (base, x, y, allowCombo = true, half = false) => {
      let comboMult = 1;
      const c = comboRef.current;
      if (allowCombo) {
        if (c >= 30) comboMult = 10;
        else if (c >= 20) comboMult = 8;
        else if (c >= 15) comboMult = 6;
        else if (c >= 10) comboMult = 5;
        else if (c >= 7) comboMult = 3;
        else if (c >= 5) comboMult = 2;
        else if (c >= 3) comboMult = 1.5;
      }
      if (half) comboMult *= 0.5;
      if (multRef.current) comboMult *= 2;

      const pts = Math.max(1, Math.ceil(base * comboMult));
      setScore((s) => s + pts);
      scoreRef.current += pts;
      spawnScoreFx(x, y, `+${pts}`, '#fff');
      if (allowCombo && c >= 3) {
        spawnComboFx(x, y + 30, `x${c}`);
      }
      return pts;
    },
    [spawnScoreFx, spawnComboFx],
  );

  const updateComboOnHit = useCallback(() => {
    const now = performance.now();
    if (now - lastPopAtRef.current <= 2000) {
      const next = comboRef.current + 1;
      setCombo(next);
      comboRef.current = next;
      if (next > maxCombo) setMaxCombo(next);

      const milestones = [3, 5, 7, 10, 15, 20, 30];
      if (milestones.includes(next)) {
        if (!reduceFlash) {
          setComboFlash(`${next}x!`);
          setTimeout(() => setComboFlash(''), 650);
        }
        haptic('combo', settings.haptics);
        playSound('combo', settings.sound);
      }
    } else {
      setCombo(1);
      comboRef.current = 1;
    }
    lastPopAtRef.current = now;
  }, [maxCombo, reduceFlash, settings.haptics, settings.sound]);

  const clearBalloon = useCallback(
    (id) => {
      // Remove from ref immediately so physics loop won’t resurrect it on next frame
      balloonsRef.current = balloonsRef.current.filter((b) => b.id !== id);
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    },
    [],
  );

  const autoPopWithShield = useCallback(
    (balloon, halfPoints = true) => {
      if (balloon.type === 'bomb') {
        setShieldZaps((prev) => [...prev, { id: uid(), x: balloon.x + balloon.w / 2, y: 120, bornAt: performance.now() }]);
        clearBalloon(balloon.id);
        return;
      }
      const base = BALLOON_TYPES[balloon.type]?.points || 1;
      addScore(base, balloon.x + balloon.w / 2, balloon.y, false, halfPoints);
      setPopCount((p) => p + 1);
      spawnBurst(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, BALLOON_TYPES[balloon.type]?.color || '#fff', 8);
      setShieldZaps((prev) => [...prev, { id: uid(), x: balloon.x + balloon.w / 2, y: 120, bornAt: performance.now() }]);
      clearBalloon(balloon.id);
    },
    [addScore, clearBalloon, spawnBurst],
  );

  const popNormal = useCallback(
    (balloon, opts = {}) => {
      const base = opts.points != null ? opts.points : BALLOON_TYPES[balloon.type]?.points || 1;
      addScore(base, balloon.x + balloon.w / 2, balloon.y, opts.allowCombo !== false, !!opts.half);
      setPopCount((p) => p + 1);

      const nextFire = fireStreakRef.current + 1;
      fireStreakRef.current = nextFire;
      setFireStreak(nextFire);
      if ([5, 10, 20].includes(nextFire)) {
        showFlash(`🔥 ON FIRE x${nextFire}!`, '#fb7185');
      }

      sessionPopsRef.current.total += 1;
      if (balloon.type === 'heartBalloon') sessionPopsRef.current.heart += 1;
      if (balloon.type === 'unicornBalloon') sessionPopsRef.current.unicorn += 1;
      if (balloon.type === 'rainbowShapeBalloon' || balloon.type === 'rainbow') sessionPopsRef.current.rainbow += 1;
      if (balloon.type === 'golden') sessionPopsRef.current.golden += 1;

      if (mode === 'zen') {
        const nextZen = (save.zenPops || 0) + 1;
        const next = { ...save, zenPops: nextZen };
        writeSave(next);
        setSave(next);
        if ([100, 500, 1000, 5000].includes(nextZen)) {
          showFlash(`🧘 ZEN MILESTONE: ${nextZen}!`, '#93c5fd');
          spawnBurst(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, '#93c5fd', 18);
        }
      }
      spawnBurst(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, BALLOON_TYPES[balloon.type]?.color || '#fff', opts.amount || 8);
      clearBalloon(balloon.id);
      if (opts.allowCombo !== false) {
        spawnMonkeyFallFx(balloon.x + balloon.w / 2, balloon.y + balloon.h + 8);
        if (Math.random() < (batterySaver ? 0.16 : 0.28)) {
          spawnBirdBurstFx(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2);
        }
        // Type-specific emoji pop FX
        if (balloon.type === 'heartBalloon') {
          spawnEmojiBurstFx(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, ['❤️', '💕', '💗', '💖']);
        } else if (balloon.type === 'unicornBalloon') {
          spawnEmojiBurstFx(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, ['✨', '⭐', '🌟', '💫']);
        } else if (balloon.type === 'rainbowShapeBalloon') {
          spawnEmojiBurstFx(balloon.x + balloon.w / 2, balloon.y + balloon.h / 2, ['🌈', '⭐', '💫', '🎆']);
        }
      }

      // Proximity chain: nearby balloons pop when they are close to the popped balloon.
      if (opts.allowChain !== false) {
        const centerX = balloon.x + balloon.w / 2;
        const centerY = balloon.y + balloon.h / 2;
        const chainRadius = 115;
        const nearby = balloonsRef.current
          .filter((b) => {
          if (b.type === 'bomb') return false;
          const bx = b.x + b.w / 2;
          const by = b.y + b.h / 2;
          return Math.hypot(bx - centerX, by - centerY) <= chainRadius;
          })
          .sort((a, b) => {
            const ax = a.x + a.w / 2;
            const ay = a.y + a.h / 2;
            const bx = b.x + b.w / 2;
            const by = b.y + b.h / 2;
            return Math.hypot(ax - centerX, ay - centerY) - Math.hypot(bx - centerX, by - centerY);
          });

        nearby
          .slice(0, 3)
          .forEach((t, i) => {
            setTimeout(() => {
              if (!endedRef.current) {
                const tBase = BALLOON_TYPES[t.type]?.points || 1;
                popNormal(t, {
                  points: Math.max(1, Math.ceil(tBase * 0.6)),
                  allowCombo: false,
                  amount: 7,
                  allowChain: false,
                });
              }
            }, 40 + i * 45);
          });
      }

      haptic('pop', settings.haptics);
      const popKind = balloon.type === 'heartBalloon' ? 'pop-heart'
        : balloon.type === 'unicornBalloon' ? 'pop-unicorn'
        : balloon.type === 'rainbowShapeBalloon' ? 'pop-rainbow'
        : 'pop';
      playSound(popKind, settings.sound);
    },
    [addScore, batterySaver, clearBalloon, mode, save, setSave, settings.haptics, settings.sound, showFlash, spawnBirdBurstFx, spawnBurst, spawnEmojiBurstFx, spawnMonkeyFallFx],
  );

  const runBombExplosion = useCallback(
    (bomb, sourceId) => {
      setLives((v) => (mode === 'zen' ? 999 : Math.max(0, v - 1)));
      breakCombo();
      haptic('bomb', settings.haptics);
      playSound('bomb', settings.sound);
      if (!reduceShake) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 450);
      }

      addShockwave(bomb.x + bomb.w / 2, bomb.y + bomb.h / 2, 130, 'rgba(255,145,60,0.75)');
      spawnBurst(bomb.x + bomb.w / 2, bomb.y + bomb.h / 2, '#ff7a18', 16);
      clearBalloon(sourceId || bomb.id);

      const nowList = [...balloonsRef.current];
      const centerX = bomb.x + bomb.w / 2;
      const centerY = bomb.y + bomb.h / 2;
      const inRadius = nowList.filter((b) => {
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        const d = Math.hypot(bx - centerX, by - centerY);
        return d <= 130 && b.id !== bomb.id;
      });

      const chainBombs = inRadius.filter((b) => b.type === 'bomb');
      const normals = inRadius.filter((b) => b.type !== 'bomb');

      normals.forEach((b) => {
        const base = BALLOON_TYPES[b.type]?.points || 1;
        popNormal(b, { points: Math.max(1, Math.ceil(base * 0.5)), allowCombo: false, amount: 10 });
      });

      chainBombs.forEach((cb, i) => {
        setTimeout(() => {
          if (!endedRef.current) runBombExplosion(cb, cb.id);
        }, 150 + i * 80);
      });
    },
    [addShockwave, breakCombo, clearBalloon, mode, popNormal, reduceShake, settings.haptics, settings.sound, spawnBurst],
  );

  const triggerRainbow = useCallback(
    (source) => {
      const normals = balloonsRef.current.filter((b) => (BALLOON_TYPES[b.type]?.kind || 'normal') === 'normal');
      showFlash(`🌈 RAINBOW! +${normals.length}`, '#ffd4ff');
      normals.forEach((b, i) => {
        setTimeout(() => {
          if (!endedRef.current) popNormal(b, { amount: 14 });
        }, i * 38);
      });
      popNormal(source, { allowCombo: true, amount: 14 });
    },
    [popNormal, showFlash],
  );

  const triggerFrozen = useCallback(
    (source) => {
      popNormal(source);
      setFreezeActive(true);
      showFlash('❄ TIME FROZEN!', '#dff8ff');
      setTimeout(() => setFreezeActive(false), 3000);
    },
    [popNormal, showFlash],
  );

  const triggerMultiplier = useCallback(
    (source) => {
      popNormal(source);
      setMultiplierActive(true);
      showFlash('✨ 2x MULTIPLIER!', '#f7c4ff');
      setTimeout(() => setMultiplierActive(false), 8000);
    },
    [popNormal, showFlash],
  );

  const triggerLightning = useCallback(
    (source) => {
      const nonBomb = balloonsRef.current.filter((b) => b.type !== 'bomb' && b.id !== source.id);
      const targetCount = Math.min(8, nonBomb.length);
      const sorted = [...nonBomb]
        .sort((a, b) => {
          const da = Math.hypot(a.x - source.x, a.y - source.y);
          const db = Math.hypot(b.x - source.x, b.y - source.y);
          return da - db;
        })
        .slice(0, targetCount);

      let chainScore = 0;
      sorted.forEach((t, i) => {
        setTimeout(() => {
          if (endedRef.current) return;
          const waveColors = ['rgba(253,234,94,0.78)', 'rgba(147,197,253,0.76)', 'rgba(244,114,182,0.72)'];
          addShockwave(t.x + t.w / 2, t.y + t.h / 2, 88, waveColors[i % waveColors.length]);
          const base = BALLOON_TYPES[t.type]?.points || 1;
          chainScore += Math.max(1, base);
          popNormal(t, { allowCombo: false, amount: 9 });
        }, i * 80);
      });
      if (!reduceShake) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 220);
      }
      showFlash(`⚡ CHROMA LIGHTNING! +${chainScore}`, '#fff5a8');
      popNormal(source, { allowCombo: false });
    },
    [addShockwave, popNormal, reduceShake, showFlash],
  );

  const triggerBigbang = useCallback(
    (source) => {
      const centerX = source.x + source.w / 2;
      const centerY = source.y + source.h / 2;
      const targets = balloonsRef.current.filter((b) => {
        if (b.type === 'bomb') return false;
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        return Math.hypot(bx - centerX, by - centerY) <= 280;
      });
      addShockwave(centerX, centerY, 500, 'rgba(255,97,61,0.6)');
      if (!reduceShake) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 420);
      }

      targets.forEach((t, i) => {
        setTimeout(() => {
          if (endedRef.current) return;
          popNormal(t, { allowCombo: false, amount: 10 });
        }, i * 20);
      });
      showFlash(`💥 BIG BANG! +${targets.length}`, '#ffd6c9');
      popNormal(source, { allowCombo: false, amount: 16 });
    },
    [addShockwave, popNormal, reduceShake, showFlash],
  );

  const triggerMagnet = useCallback(
    (source) => {
      showFlash('🧲 MAGNET PULL!', '#e9d5ff');
      const centerX = GAME_W / 2;
      const centerY = GAME_H / 2;
      const targets = balloonsRef.current.filter((b) => b.type !== 'bomb' && b.id !== source.id);

      setBalloons((prev) =>
        prev.map((b) => {
          if (b.type === 'bomb' || b.id === source.id) return b;
          return {
            ...b,
            magnetTo: { x: centerX - b.w / 2, y: centerY - b.h / 2, start: performance.now(), dur: 450 },
          };
        }),
      );

      setTimeout(() => {
        targets.forEach((t, i) => {
          setTimeout(() => {
            if (!endedRef.current) popNormal(t, { allowCombo: false, amount: 8 });
          }, i * 35);
        });
      }, 460);

      popNormal(source, { allowCombo: false, amount: 10 });
    },
    [popNormal, showFlash],
  );

  const triggerShield = useCallback(
    (source) => {
      popNormal(source, { allowCombo: false });
      showFlash('🛡 SHIELD ACTIVE', '#a5f3fc');
      setShieldActive(true);
      setTimeout(() => setShieldActive(false), 10000);
    },
    [popNormal, showFlash],
  );

  const triggerExplosiveChain = useCallback(
    (source) => {
      showFlash('🔥 EXPLOSIVE CHAIN!', '#ff6b6b');
      setExplosiveChainActive(true);
      popNormal(source, { allowCombo: false, amount: 12 });
      
      const chainBalloons = balloonsRef.current.filter((b) => b.type !== 'bomb' && b.id !== source.id);
      chainBalloons.slice(0, 22).forEach((b, i) => {
        setTimeout(() => {
          if (!endedRef.current) popNormal(b, { allowCombo: false, amount: 10 });
        }, i * 35);
      });
      setTimeout(() => setExplosiveChainActive(false), 1200);
    },
    [popNormal, showFlash],
  );

  const triggerBubbleWave = useCallback(
    (source) => {
      showFlash('🌊 BUBBLE WAVE!', '#0ea5e9');
      setBubbleWaveActive(true);
      popNormal(source, { allowCombo: false, amount: 10 });
      
      setBalloons((prev) =>
        prev.map((b) => {
          if (b.type === 'bomb' || b.id === source.id) return b;
          return {
            ...b,
            wavePush: { startY: b.y, start: performance.now(), dur: 600, pushDistance: 120 },
          };
        }),
      );
      setTimeout(() => setBubbleWaveActive(false), 600);
    },
    [popNormal, showFlash],
  );

  const triggerJackpot = useCallback(
    (source) => {
      const mult = Math.random() < 0.5 ? 5 : Math.random() < 0.7 ? 4 : 3;
      showFlash(`💎 JACKPOT x${mult}!`, '#d8b4fe');
      setJackpotActive(true);
      popNormal(source, { allowCombo: false });
      
      const jackpotScore = Math.floor(Math.random() * 200) + 100;
      setScore((s) => s + jackpotScore * mult);
      spawnScoreFx(source.x + source.w / 2, source.y, `+${jackpotScore * mult}!`, '#d8b4fe', true);
      setTimeout(() => setJackpotActive(false), 1200);
    },
    [popNormal, showFlash, spawnScoreFx],
  );

  const triggerPrecisionFocus = useCallback(
    (source) => {
      showFlash('🎯 PRECISION FOCUS!', '#fbbf24');
      setPrecisionFocusActive(true);
      popNormal(source, { allowCombo: false, amount: 10 });
      setTimeout(() => setPrecisionFocusActive(false), 4000);
    },
    [popNormal, showFlash],
  );

  const triggerTornado = useCallback(
    (source) => {
      showFlash('🌪 TORNADO SPIN!', '#10b981');
      setTornadoActive(true);
      const centerX = GAME_W / 2;
      const centerY = GAME_H / 2;
      
      setBalloons((prev) =>
        prev.map((b) => {
          if (b.type === 'bomb' || b.id === source.id) return b;
          const angle = Math.atan2(b.y - centerY, b.x - centerX);
          return {
            ...b,
            tornadoSpin: { angle, start: performance.now(), dur: 2000, radius: 150 },
          };
        }),
      );
      
      setTimeout(() => {
        balloonsRef.current.forEach((b, i) => {
          if (b.type !== 'bomb' && b.id !== source.id) {
            setTimeout(() => {
              if (!endedRef.current) popNormal(b, { allowCombo: false, amount: 8 });
            }, i * 30);
          }
        });
      }, 1500);
      
      popNormal(source, { allowCombo: false, amount: 14 });
      setTimeout(() => setTornadoActive(false), 2000);
    },
    [popNormal, showFlash],
  );

  const triggerLuckyDraw = useCallback(
    (source) => {
      const bonusPoints = 500;
      showFlash(`💰 LUCKY DRAW! +${bonusPoints}`, '#f59e0b');
      setScore((s) => s + bonusPoints);
      spawnScoreFx(source.x + source.w / 2, source.y, `+${bonusPoints}`, '#f59e0b', true);
      popNormal(source, { allowCombo: false, amount: 12 });
    },
    [popNormal, showFlash, spawnScoreFx],
  );

  const triggerOverdrive = useCallback(
    (source) => {
      showFlash('⚡ OVERDRIVE!', '#ec4899');
      setOverdrive(3);
      popNormal(source, { allowCombo: false, amount: 10 });
      setTimeout(() => setOverdrive(1), 3000);
    },
    [popNormal, showFlash],
  );

  const triggerReflectShield = useCallback(
    (source) => {
      showFlash('🛡 REFLECT SHIELD!', '#8b5cf6');
      setReflectShieldActive(true);
      popNormal(source, { allowCombo: false, amount: 10 });
      setTimeout(() => setReflectShieldActive(false), 5000);
    },
    [popNormal, showFlash],
  );

  const triggerComboBooster = useCallback(
    (source) => {
      const boost = 5;
      setCombo((c) => c + boost);
      comboRef.current += boost;
      if (comboRef.current > maxCombo) setMaxCombo(comboRef.current);
      showFlash(`🌟 COMBO +${boost}!`, '#06f6d4');
      popNormal(source, { allowCombo: false, amount: 10 });
      spawnComboFx(source.x + source.w / 2, source.y, `+${boost}`, false);
    },
    [popNormal, showFlash, maxCombo, spawnComboFx],
  );

  const triggerHomingBalloons = useCallback(
    (source) => {
      showFlash('📍 HOMING BALLOONS!', '#fbbf24');
      setHomingBalloonsCount(10);
      popNormal(source, { allowCombo: false, amount: 10 });
    },
    [popNormal, showFlash],
  );

  const registerPowerupSynergy = useCallback(
    (powerKey, source) => {
      const active = activePowerupsRef.current;
      active.add(powerKey);
      setTimeout(() => active.delete(powerKey), 4200);

      const triggerSynergyClear = (label, color) => {
        const targets = balloonsRef.current.filter((b) => b.type !== 'bomb');
        showFlash(label, color);
        targets.slice(0, 40).forEach((b, i) => {
          setTimeout(() => {
            if (!endedRef.current) popNormal(b, { allowCombo: false, amount: 9, allowChain: false });
          }, i * 14);
        });
        spawnBurst(source.x + source.w / 2, source.y + source.h / 2, color, 20);
        active.clear();
      };

      if (active.has('lightning') && active.has('overdrive')) {
        triggerSynergyClear('⚡ THUNDERSTRIKE SYNERGY!', '#fde047');
      } else if (active.has('magnet') && active.has('bubbleWave')) {
        triggerSynergyClear('🌊 TIDAL VORTEX SYNERGY!', '#67e8f9');
      } else if (active.has('shield') && active.has('reflectShield')) {
        showFlash('🛡 AEGIS SYNERGY! BONUS LIFE', '#a5b4fc');
        if (mode === 'campaign') setLives((v) => Math.min(5, v + 1));
        active.clear();
      }
    },
    [mode, popNormal, showFlash, spawnBurst],
  );

  const revealPowerupTip = useCallback(
    (type, x, y) => {
      if (save.seenPowerups?.[type]) return;
      const tips = {
        powerupLightning: 'NEW: Lightning chains nearby balloons',
        powerupBigbang: 'NEW: Big Bang clears a huge radius',
        powerupMagnet: 'NEW: Magnet drags balloons to center',
        powerupShield: 'NEW: Shield auto-pops escaped balloons',
        powerupExplosiveChain: 'NEW: Chain reaction clears balloons',
        powerupBubbleWave: 'NEW: Wave pushes balloons down',
        powerupJackpot: 'NEW: Random 3-5x bonus points',
        powerupPrecisionFocus: 'NEW: Slows balloons for 4 seconds',
        powerupTornado: 'NEW: Tornado vortex pulls balloons',
        powerupLuckyDraw: 'NEW: Instant +500 points',
        powerupOverdrive: 'NEW: Balloons 3x faster for 3 sec',
        powerupReflectShield: 'NEW: Escaped balloons bounce back',
        powerupComboBooster: 'NEW: Instant +5 combo stacks',
        powerupHomingBalloons: 'NEW: Next 10 balloons spawn centered',
      };
      const next = {
        ...save,
        seenPowerups: {
          ...(save.seenPowerups || {}),
          [type]: true,
        },
      };
      writeSave(next);
      setSave(next);
      showFlash('NEW POWER-UP UNLOCKED!', '#fde68a');
      spawnScoreFx(x, y, tips[type] || 'NEW POWER-UP', '#fff4a3', true);
    },
    [save, setSave, showFlash, spawnScoreFx],
  );

  const popBalloon = useCallback(
    (balloon) => {
      if (endedRef.current) return;

      if (balloon.type === 'armored') {
        if (balloon.hp > 1) {
          const updated = balloonsRef.current.map((b) => {
            if (b.id !== balloon.id) return b;
            return {
              ...b,
              hp: b.hp - 1,
              hitFlash: true,
              firstHitAt: b.firstHitAt || performance.now(),
            };
          });
          balloonsRef.current = updated;
          setBalloons(updated);
          setTimeout(() => {
            setBalloons((prev) => prev.map((b) => (b.id === balloon.id ? { ...b, hitFlash: false } : b)));
            balloonsRef.current = balloonsRef.current.map((b) => (b.id === balloon.id ? { ...b, hitFlash: false } : b));
          }, 110);
          spawnScoreFx(balloon.x + balloon.w / 2, balloon.y - 8, `${balloon.hp - 1}/${balloon.hpMax} LEFT`, '#fef08a');
          haptic('pop', settings.haptics);
          return;
        }

        const delta = performance.now() - (balloon.firstHitAt || performance.now());
        let bonusMult = 1;
        let label = 'SOLID!';
        if (delta < 1500) {
          bonusMult = 3;
          label = 'LIGHTNING!';
        } else if (delta < 2500) {
          bonusMult = 2;
          label = 'FAST!';
        } else if (delta < 4000) {
          bonusMult = 1.5;
          label = 'QUICK!';
        }
        showFlash(label, '#fde68a');
        const base = (balloon.hpMax || 2) * 2;
        updateComboOnHit();
        popNormal(balloon, { points: Math.ceil(base * bonusMult), amount: 12 });
        setHits((h) => h + 1);
        return;
      }

      setHits((h) => h + 1);
      updateComboOnHit();

      if (balloon.type === 'bomb') {
        runBombExplosion(balloon);
        return;
      }
      if (balloon.type === 'rainbow') {
        playSound('rainbow', settings.sound);
        triggerRainbow(balloon);
        return;
      }
      if (balloon.type === 'golden') {
        showFlash('✨ GOLDEN! +5', '#ffe58f');
        playSound('golden', settings.sound);
        popNormal(balloon, { points: 5, amount: 12 });
        return;
      }
      if (balloon.type === 'frozen') {
        triggerFrozen(balloon);
        return;
      }
      if (balloon.type === 'multiplier') {
        triggerMultiplier(balloon);
        return;
      }
      if (balloon.type === 'powerupLightning') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('lightning', balloon);
        triggerLightning(balloon);
        return;
      }
      if (balloon.type === 'powerupBigbang') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerBigbang(balloon);
        return;
      }
      if (balloon.type === 'powerupMagnet') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('magnet', balloon);
        triggerMagnet(balloon);
        return;
      }
      if (balloon.type === 'powerupShield') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('shield', balloon);
        triggerShield(balloon);
        return;
      }
      if (balloon.type === 'powerupExplosiveChain') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerExplosiveChain(balloon);
        return;
      }
      if (balloon.type === 'powerupBubbleWave') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('bubbleWave', balloon);
        triggerBubbleWave(balloon);
        return;
      }
      if (balloon.type === 'powerupJackpot') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerJackpot(balloon);
        return;
      }
      if (balloon.type === 'powerupPrecisionFocus') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerPrecisionFocus(balloon);
        return;
      }
      if (balloon.type === 'powerupTornado') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerTornado(balloon);
        return;
      }
      if (balloon.type === 'powerupLuckyDraw') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerLuckyDraw(balloon);
        return;
      }
      if (balloon.type === 'powerupOverdrive') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('overdrive', balloon);
        triggerOverdrive(balloon);
        return;
      }
      if (balloon.type === 'powerupReflectShield') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        registerPowerupSynergy('reflectShield', balloon);
        triggerReflectShield(balloon);
        return;
      }
      if (balloon.type === 'powerupComboBooster') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerComboBooster(balloon);
        return;
      }
      if (balloon.type === 'powerupHomingBalloons') {
        playSound('powerup', settings.sound);
        revealPowerupTip(balloon.type, balloon.x + balloon.w / 2, balloon.y - 10);
        triggerHomingBalloons(balloon);
        return;
      }

      if (balloon.gracingAt) showFlash('⚡ LAST CHANCE SAVE!', '#ff6b6b');
      popNormal(balloon);
    },
    [
      popNormal,
      revealPowerupTip,
      runBombExplosion,
      showFlash,
      spawnScoreFx,
      settings.haptics,
      settings.sound,
      triggerBigbang,
      triggerFrozen,
      triggerLightning,
      triggerMagnet,
      triggerMultiplier,
      triggerRainbow,
      triggerShield,
      triggerExplosiveChain,
      triggerBubbleWave,
      triggerJackpot,
      triggerPrecisionFocus,
      triggerTornado,
      triggerLuckyDraw,
      triggerOverdrive,
      triggerReflectShield,
      triggerComboBooster,
      triggerHomingBalloons,
      registerPowerupSynergy,
      updateComboOnHit,
    ],
  );

  const spawnOne = useCallback(() => {
    if (pausedRef.current || endedRef.current) return;

    const e = elapsedRef.current;
    const params =
      mode === 'campaign'
        ? { speed: level.speed, spawnMs: level.spawnMs }
        : mode === 'survival'
          ? survivalParams(e)
          : { speed: 1.7, spawnMs: 460 };

    const type = pickBalloonType(
      mode === 'campaign' ? level : { worldIdx, levelIdx: Math.floor(e / 6) },
      mode,
      e,
    );
    const fast = type === 'fast';
    const isPowerup = type.startsWith('powerup');
    const w = fast ? rand(44, 56) : isPowerup ? rand(72, 88) : rand(56, 80);
    const h = fast ? rand(58, 72) : isPowerup ? rand(88, 106) : rand(74, 98);
    const buoyancy = clamp(1.1 - (w - 44) / 90, 0.75, 1.18);
    const baseVy = (fast ? 1.8 : 1) * params.speed * rand(0.85, 1.12);
    const wobbleFreq = rand(550, 950);
    const wobbleAmp = rand(4, 9);

    const hpMax = type === 'armored' ? Math.min(2 + (level?.worldIdx ?? 0), 5) : 1;

    // Homing balloons: spawn closer to center
    let xMin = 10;
    let xMax = GAME_W - 10;
    if (homingBalloonsCount > 0) {
      const centerX = GAME_W / 2;
      const range = 140;
      xMin = Math.max(10, centerX - range);
      xMax = Math.min(GAME_W - 10, centerX + range);
    }

    const b = {
      id: uid(),
      type,
      x: rand(xMin, xMax - w),
      y: GAME_H + rand(12, 68),
      w,
      h,
      vx: rand(-0.15, 0.15),
      vy: baseVy,
      buoyancy,
      wobbleFreq,
      wobbleAmp,
      wobbleBias: rand(-0.15, 0.15),
      phase: rand(0, Math.PI * 2),
      popFx: false,
      hp: hpMax,
      hpMax,
      hitFlash: false,
      firstHitAt: 0,
      magnetTo: null,
      stringSway: 0,
      bornAt: performance.now(),
    };

    const next = [...balloonsRef.current, b];
    balloonsRef.current = next;
    setBalloons(next);

    if (homingBalloonsCount > 0) {
      setHomingBalloonsCount((c) => Math.max(0, c - 1));
    }

    const densityScale = mode === 'survival' ? 0.68 : mode === 'campaign' ? 0.8 : 0.76;
    const nextDelay = Math.max(70, (params.spawnMs + rand(-80, 80)) * densityScale);
    setTimeout(spawnOne, nextDelay);
  }, [level, mode, worldIdx, homingBalloonsCount]);

  const evaluateLevel = useCallback(
    (lifeEnded = false) => {
      if (endedRef.current) return;
      endedRef.current = true;

      const totalTaps = taps || 1;
      const accuracy = (hits / totalTaps) * 100;
      const passed = popRef.current >= level.goal && !lifeEnded;

      let stars = 0;
      if (passed) {
        stars = 1;
        if (scoreRef.current >= level.star2) stars = 2;

        let mastery = false;
        if (level.type === 'ScoreAttack' || level.type === 'Boss') mastery = scoreRef.current >= level.star3Score;
        if (level.type === 'Precision') mastery = accuracy >= 95;
        if (level.type === 'Survival') mastery = escapesRef.current === 0;
        if (level.type === 'Chain') mastery = maxCombo >= 10;
        if (mastery) stars = 3;
      }

      const result = {
        passed,
        score: scoreRef.current,
        popCount: popRef.current,
        escapes: escapesRef.current,
        taps,
        hits,
        misses,
        accuracy,
        maxCombo,
        stars,
        newTitleUnlocked: null,
        newWorldBadge: null,
        prevBest: save.bestScoreByLevel?.[`${level.worldIdx}-${level.levelIdx}`] || 0,
      };

      if (passed) haptic('star', settings.haptics);
      if (passed) playSound('star', settings.sound);

      const session = sessionPopsRef.current;
      const merged = {
        ...save,
        totalPops: (save.totalPops || 0) + (session.total || 0),
        bestCombo: Math.max(save.bestCombo || 0, maxCombo),
      };

      merged.dailyProgress = mergeDailyProgress(save.dailyProgress || {}, {
        totalPops: session.total || 0,
        heartPops: session.heart || 0,
        unicornPops: session.unicorn || 0,
        rainbowPops: session.rainbow || 0,
        goldenPops: session.golden || 0,
        maxCombo,
      });

      if (passed) {
        const key = `${level.worldIdx}-${level.levelIdx}`;
        const prevStars = save.starsByLevel[key] || 0;
        const prevBest = save.bestScoreByLevel[key] || 0;
        merged.starsByLevel = { ...save.starsByLevel, [key]: Math.max(prevStars, stars) };
        merged.bestScoreByLevel = { ...save.bestScoreByLevel, [key]: Math.max(prevBest, scoreRef.current) };
        const totalStars = Object.values(merged.starsByLevel).reduce((a, b) => a + b, 0);
        merged.totalStars = totalStars;
        const nextTitle = getRoyalTitle(totalStars);
        const prevTitle = save.royalTitle || getRoyalTitle(save.totalStars || 0);
        merged.royalTitle = nextTitle;
        if (nextTitle !== prevTitle) result.newTitleUnlocked = nextTitle;

        const worldCleared = Array.from({ length: LEVELS_PER_WORLD }, (_, i) => merged.starsByLevel[`${level.worldIdx}-${i}`] || 0).every(
          (v) => v > 0,
        );
        if (worldCleared) {
          const badgeKey = `world-${level.worldIdx}`;
          if (!merged.unlockedBadges?.[badgeKey]) {
            merged.unlockedBadges = { ...(merged.unlockedBadges || {}), [badgeKey]: true };
            result.newWorldBadge = WORLDS[level.worldIdx]?.name || 'World';
          }
        }

        merged.dailyProgress = mergeDailyProgress(merged.dailyProgress, { levelsWon: 1 });
        if (escapesRef.current === 0) {
          merged.perfectLevels = (save.perfectLevels || 0) + 1;
          merged.dailyProgress = mergeDailyProgress(merged.dailyProgress, { perfectLevels: 1 });
        }
      }

      const newlyUnlockedSkins = BALLOON_SKINS
        .filter((s) => (merged.totalStars || 0) >= s.starsNeeded)
        .map((s) => s.id);
      if (!newlyUnlockedSkins.includes(merged.activeSkin)) {
        merged.activeSkin = 'classic';
      }

      const newAchievements = checkAndAwardAchievements(merged);
      const achievementIds = Object.keys(newAchievements);
      if (achievementIds.length > 0) {
        merged.unlockedBadges = { ...(merged.unlockedBadges || {}), ...newAchievements };
        result.newAchievements = achievementIds;
      }

      writeSave(merged);
      setSave(merged);

      onResult(result);
    },
    [hits, level, maxCombo, misses, onResult, save, setSave, settings.haptics, settings.sound, taps],
  );

  const endSurvival = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    const result = {
      score: scoreRef.current,
      popCount: popRef.current,
      elapsed,
      maxCombo,
      escapes: escapesRef.current,
      taps,
      hits,
      misses,
    };
    const session = sessionPopsRef.current;
    const merged = {
      ...save,
      survivalBest: Math.max(save.survivalBest || 0, scoreRef.current),
      survivalBestTime: Math.max(save.survivalBestTime || 0, elapsed),
      survivalRuns: (save.survivalRuns || 0) + 1,
      totalPops: (save.totalPops || 0) + (session.total || 0),
      bestCombo: Math.max(save.bestCombo || 0, maxCombo),
    };

    merged.dailyProgress = mergeDailyProgress(save.dailyProgress || {}, {
      totalPops: session.total || 0,
      heartPops: session.heart || 0,
      unicornPops: session.unicorn || 0,
      rainbowPops: session.rainbow || 0,
      goldenPops: session.golden || 0,
      maxCombo,
      survivalTime: elapsed,
    });

    const newAchievements = checkAndAwardAchievements(merged);
    if (Object.keys(newAchievements).length > 0) {
      merged.unlockedBadges = { ...(merged.unlockedBadges || {}), ...newAchievements };
    }

    writeSave(merged);
    setSave(merged);
    onResult(result);
  }, [elapsed, hits, maxCombo, misses, onResult, save, setSave, taps]);

  useEffect(() => {
    const id = requestAnimationFrame(function tick(now) {
      if (!endedRef.current) {
        const last = lastFrameRef.current;
        let dt = (now - last) / 16.666;
        dt = clamp(dt, 0.45, 2.4);
        lastFrameRef.current = now;

        if (!pausedRef.current && !showTutorialRef.current) {
          const wind = windRef.current;
          if (now >= wind.nextChange) {
            wind.targetX = rand(-0.55, 0.55);
            if (Math.random() < 0.25) wind.gustStrength = rand(-0.8, 0.8);
            wind.nextChange = now + rand(3000, 7000);
          }
          wind.gustStrength *= 0.985;
          wind.x += (wind.targetX - wind.x) * 0.012;

          const freezeScale = freezeRef.current ? 0.2 : 1;
          const overdriveScale = overdriveRef.current;
          const precisionScale = precisionFocusRef.current ? 0.6 : 1;
          const speedScale = freezeScale * overdriveScale * precisionScale;

          // Physics runs every rAF frame from the ref (no React overhead)
          const prev = balloonsRef.current;
          const next = [];

          for (let i = 0; i < prev.length; i += 1) {
            const b = { ...prev[i] };

            if (b.magnetTo) {
              const t = clamp((now - b.magnetTo.start) / b.magnetTo.dur, 0, 1);
              const ease = 1 - Math.pow(1 - t, 3);
              b.x = b.x + (b.magnetTo.x - b.x) * ease;
              b.y = b.y + (b.magnetTo.y - b.y) * ease;
              if (t >= 1) b.magnetTo = null;
            } else if (b.wavePush) {
              const t = clamp((now - b.wavePush.start) / b.wavePush.dur, 0, 1);
              const ease = t < 0.5 ? 2 * t * t : -1 + 4 * t - 2 * t * t;
              b.y = b.wavePush.startY + b.wavePush.pushDistance * ease;
              if (t >= 1) b.wavePush = null;
            } else if (b.tornadoSpin) {
              const t = clamp((now - b.tornadoSpin.start) / b.tornadoSpin.dur, 0, 1);
              const rot = b.tornadoSpin.angle + t * Math.PI * 4;
              const centerX = GAME_W / 2;
              const centerY = GAME_H / 2;
              const r = b.tornadoSpin.radius * (1 - t);
              b.x = centerX + Math.cos(rot) * r - b.w / 2;
              b.y = centerY + Math.sin(rot) * r - b.h / 2;
              if (t >= 1) b.tornadoSpin = null;
            } else {
              const wobbleForce = Math.cos(now / b.wobbleFreq + b.phase) * 0.018;
              b.vx += ((wind.x + wind.gustStrength) - b.vx) * 0.022;
              b.vx += wobbleForce;
              b.vx += b.wobbleBias * 0.004;
              b.vx = clamp(b.vx, -1.1, 1.1);

              b.x += b.vx * dt * 4.6 * speedScale;
              const shimmer = Math.sin(now / 190 + b.phase * 1.6) * 0.07;
              b.y -= (b.vy * b.buoyancy + shimmer) * dt * speedScale;

              if (b.x < 4) {
                b.x = 4;
                b.vx = Math.abs(b.vx) * 0.6;
              }
              if (b.x > GAME_W - b.w - 4) {
                b.x = GAME_W - b.w - 4;
                b.vx = -Math.abs(b.vx) * 0.6;
              }
            }

            // String inertia: larger balloons trail more, fast balloons stay tighter and snap back sooner.
            const wobblePhase = Math.sin(now / b.wobbleFreq + b.phase);
            const heaviness = clamp((b.w - 44) / 36, 0, 1);
            const tightness = b.type === 'fast' ? 0.62 : 1;
            const targetSway = clamp(
              b.vx * (34 + heaviness * 26) * tightness + wobblePhase * (6 + heaviness * 8) * tightness,
              -24,
              24,
            );
            const response = b.type === 'fast' ? 0.32 : clamp(0.11 - heaviness * 0.045, 0.06, 0.12);
            b.stringSway = (b.stringSway || 0) + (targetSway - (b.stringSway || 0)) * response;

            if (shieldRef.current && b.y < 120) {
              autoPopWithShield(b, true);
              continue;
            }

            if (b.y + b.h < -24) {
              if (!b.gracingAt) {
                // Start 380ms last-chance window — freeze balloon at top edge
                b.gracingAt = now;
                b.y = 0;
                next.push(b);
                continue;
              }
              if (now - b.gracingAt < 380) {
                // Still in window — keep frozen at top, awaiting tap
                b.y = 0;
                next.push(b);
                continue;
              }
              // Grace expired — actual escape
              if (mode === 'campaign') setLives((v) => Math.max(0, v - 1));
              setMisses((m) => m + 1);
              setEscapes((e) => e + 1);
              breakCombo();
              continue;
            }

            next.push(b);
          }

          // Always update the ref so hit-testing stays frame-accurate
          balloonsRef.current = next;
          // Push to React state every other frame (~30fps renders) to halve re-render cost
          rafFrameRef.current += 1;
          if (rafFrameRef.current % 2 === 0) {
            setBalloons(next);
          }

          if (comboRef.current >= 1 && now - lastPopAtRef.current > 2000) {
            breakCombo();
          }
        }

        requestAnimationFrame(tick);
      }
    });

    return () => cancelAnimationFrame(id);
  }, [autoPopWithShield, breakCombo, mode]);

  useEffect(() => {
    const t = setTimeout(spawnOne, 250);
    return () => clearTimeout(t);
  }, [spawnOne]);

  useEffect(() => {
    if (mode !== 'campaign') return undefined;
    const timer = setInterval(() => {
      if (pausedRef.current || endedRef.current) return;
      setTimeLeft((t) => {
        if (t <= 1) {
          evaluateLevel(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluateLevel, mode]);

  useEffect(() => {
    if (mode !== 'survival') return undefined;
    const timer = setInterval(() => {
      if (pausedRef.current || endedRef.current) return;
      setElapsed((e) => e + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = performance.now();
      setParticles((prev) => prev.filter((p) => now - p.bornAt < 700));
      setShockwaves((prev) => prev.filter((s) => now - s.bornAt < (batterySaver ? 560 : 700)));
      setShieldZaps((prev) => prev.filter((s) => now - s.bornAt < 500));
      setFloatingScores((prev) => prev.filter((f) => now - f.bornAt < (f.big ? 1700 : 1000)));
      setFloatingCombos((prev) => prev.filter((c) => now - c.bornAt < 1000));
      setMonkeyFalls((prev) => prev.filter((m) => now - m.bornAt < 1150));
      setBirdBursts((prev) => prev.filter((b) => now - b.bornAt < 980));
    }, 500);
    return () => clearInterval(timer);
  }, [batterySaver]);

  useEffect(() => {
    if (mode === 'campaign' && lives <= 0 && !endedRef.current) {
      evaluateLevel(true);
    }
    if (mode === 'survival' && (lives <= 0 || escapes >= 10) && !endedRef.current) {
      endSurvival();
    }
  }, [endSurvival, evaluateLevel, escapes, lives, mode]);

  const handleTapBoard = (e) => {
    if (paused || showTutorial || endedRef.current) return;
    setTaps((t) => t + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = null;
    for (let i = balloonsRef.current.length - 1; i >= 0; i -= 1) {
      const b = balloonsRef.current[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        found = b;
        break;
      }
    }

    if (!found) {
      breakCombo();
      return;
    }

    popBalloon(found);
  };

  const comboBadgeText = combo >= 3 ? `🔥 ${combo}x COMBO` : '';
  const comboBadgeAlign = mode === 'survival' ? 'flex-end' : 'flex-start';
  const hudWorld = WORLDS[worldIdx] || WORLDS[0];
  const hudMeta = WORLD_META[worldIdx] || WORLD_META[0];
  const [accent1, accent2, accent3] = hudMeta.balloonColors;

  const areaHudShell = {
    ...hud,
    margin: '8px 10px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: largeHud ? '11px 12px' : hud.padding,
    background: `linear-gradient(140deg, ${hudWorld.palette.top}99 0%, ${hudWorld.palette.mid}8f 55%, ${hudWorld.palette.bot}88 100%)`,
    border: `2px solid ${accent2}cc`,
    boxShadow: `0 4px 0 rgba(0,0,0,0.18), 0 10px 24px ${hudWorld.palette.top}66, inset 0 1px 0 rgba(255,255,255,0.68)`,
  };

  const threatMeter = getWorldThreat(worldIdx);
  const nextMilestone = mode === 'campaign' ? level.star2 : Math.ceil(score * 1.3);
  const distToMilestone = nextMilestone - score;
  const personalBest = mode === 'campaign' && level ? save.bestScoreByLevel?.[`${level.worldIdx}-${level.levelIdx}`] || 0 : 0;
  const isNewRecord = score > personalBest;
  const escapeWarning = mode !== 'zen' && escapes >= 7;

  const areaStatBoxes = [
    {
      ...statBox,
      fontSize: largeHud ? 16 : statBox.fontSize,
      padding: largeHud ? '8px 10px' : statBox.padding,
      background: `linear-gradient(135deg, ${accent1}d0, ${hudWorld.palette.top}a8)`,
      border: `2px solid ${accent2}bb`,
    },
    {
      ...statBox,
      fontSize: largeHud ? 16 : statBox.fontSize,
      padding: largeHud ? '8px 10px' : statBox.padding,
      background: `linear-gradient(135deg, ${accent2}cf, ${hudWorld.palette.mid}a8)`,
      border: `2px solid ${accent3}bb`,
    },
    {
      ...statBox,
      fontSize: largeHud ? 16 : statBox.fontSize,
      padding: largeHud ? '8px 10px' : statBox.padding,
      background: `linear-gradient(135deg, ${accent3}cf, ${hudWorld.palette.bot}a8)`,
      border: `2px solid ${accent1}bb`,
    },
    {
      ...statBox,
      fontSize: largeHud ? 16 : statBox.fontSize,
      padding: largeHud ? '8px 10px' : statBox.padding,
      background: `linear-gradient(135deg, ${hudWorld.palette.top}cc, ${hudWorld.palette.mid}a6)`,
      border: `2px solid ${accent1}bb`,
    },
  ];

  const areaControlStrip = {
    margin: '8px 10px 0 auto',
    display: 'flex',
    width: 'fit-content',
    zIndex: 12,
    padding: '6px 8px',
    borderRadius: 14,
    background: `linear-gradient(135deg, ${hudWorld.palette.mid}66, ${hudWorld.palette.bot}55)`,
    border: `1px solid ${accent2}aa`,
    boxShadow: `0 3px 0 rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.45)`,
  };

  const boardStyle = {
    ...screenShell(worldIdx),
    overflow: 'hidden',
    transform: screenShake ? 'translateX(0)' : 'none',
    animation: screenShake ? 'shake 0.45s ease' : 'none',
  };

  return (
    <div style={boardStyle}>
      <WorldBackdrop worldIdx={worldIdx} />
      <div style={{ ...uiLayer, paddingTop: 6 }}>
        <div style={areaHudShell}>
          {/* Level Type + Threat Meter */}
          {mode === 'campaign' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div style={{ ...levelBadge, fontSize: 12, padding: '5px 8px', background: 'rgba(99,102,241,0.3)', border: `1px solid ${accent2}99` }}>
                {level.type}
              </div>
              <div style={{ fontSize: 10, color: '#fff8', display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'flex-end', padding: '5px 8px' }}>
                💣 {threatMeter.bomb}% | ⚡ {threatMeter.fast}% | 🛡 {threatMeter.armor}%
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* Score + Personal Best */}
            <div style={{ ...areaStatBoxes[0] }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Score</div>
              <div style={{ fontSize: 18, fontFamily: "'Titan One', cursive" }}>{score}</div>
              {personalBest > 0 && (
                <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2 }}>Best: {personalBest}</div>
              )}
            </div>

            {/* Lives + Escape Warning */}
            <div style={{ ...areaStatBoxes[1] }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{mode === 'survival' ? 'Escapes' : 'Lives'}</div>
              <div style={{ fontSize: 16 }}>
                {mode === 'survival'
                  ? `${escapes}/10`
                  : mode === 'zen' ? '∞' : '❤️'.repeat(lives)}
                {escapeWarning && <span style={{ marginLeft: 4, fontSize: 14 }}>⚠️</span>}
              </div>
              {mode === 'campaign' && (
                <div style={{ fontSize: 9, opacity: escapeWarning ? 1 : 0.65, marginTop: 2, color: escapeWarning ? '#fbbf24' : 'inherit' }}>
                  Escapes: {escapes}/10
                </div>
              )}
            </div>

            {/* Pops Progress */}
            <div style={{ ...areaStatBoxes[2] }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Pops</div>
              <div style={{ fontSize: 16 }}>
                {popCount}{mode === 'campaign' ? `/${level.goal}` : ''}
              </div>
              {mode === 'campaign' && (
                <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2 }}>
                  {level.goal - popCount > 0 ? `${level.goal - popCount} left` : '✓ Clear!'}
                </div>
              )}
            </div>

            {/* Next Milestone or Time */}
            <div style={{ ...areaStatBoxes[3] }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>
                {mode === 'campaign' ? (distToMilestone > 0 ? 'Next ⭐' : 'Mastery') : 'Time'}
              </div>
              <div style={{ fontSize: 16, fontFamily: "'Titan One', cursive", color: isNewRecord ? '#fbbf24' : 'inherit' }}>
                {mode === 'campaign' ? (distToMilestone > 0 ? distToMilestone : 'Ready') : `${(mode === 'campaign' ? timeLeft : elapsed.toFixed(1))}${mode !== 'campaign' ? 's' : 's'}`}
              </div>
              {isNewRecord && (
                <div style={{ fontSize: 9, opacity: 1, marginTop: 2, color: '#fbbf24', fontWeight: 'bold' }}>NEW RECORD!</div>
              )}
              {mode === 'survival' && (save.survivalBestTime || 0) > 0 && (
                <div style={{ fontSize: 9, opacity: 0.65, marginTop: 1, color: elapsed > (save.survivalBestTime || 0) ? '#4ade80' : 'inherit' }}>
                  {elapsed > (save.survivalBestTime || 0) ? '🏆 NEW PB!' : `PB ${(save.survivalBestTime || 0).toFixed(1)}s`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small X button top-left */}
        <button
          onClick={() => setPaused(true)}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 50,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.45)',
            background: 'rgba(30,41,59,0.72)',
            color: '#fff',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
          }}
          title="Pause"
        >✕</button>

        {shieldActive && (
          <>
            <div
              style={{
                position: 'absolute',
                left: 18,
                right: 18,
                top: 120,
                height: 6,
                borderRadius: 6,
                background:
                  'linear-gradient(90deg, rgba(34,211,238,0.2), rgba(34,211,238,0.8), rgba(165,243,252,0.2))',
                boxShadow: '0 0 18px rgba(34,211,238,0.75)',
                animation: 'shield-pulse 0.6s ease-in-out infinite alternate',
                overflow: 'hidden',
                zIndex: 7,
              }}
            >
              <div
                style={{
                  width: '40%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%)',
                  animation: 'shield-scroll 1.2s linear infinite',
                }}
              />
            </div>
            <div
              style={{
                ...levelBadge,
                position: 'absolute',
                top: 132,
                left: 120,
                width: 150,
                zIndex: 8,
                background: 'linear-gradient(135deg,#06b6d4,#67e8f9)',
                animation: 'shield-badge-pulse 0.9s ease-in-out infinite',
              }}
            >
              🛡 SHIELD ACTIVE
            </div>
          </>
        )}

        {/* Combo badge hidden - now shown as floating indicator at balloon */}

        {/* Powerup status indicators */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200, zIndex: 12 }}>
          {fireStreak >= 5 && (
            <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: 'linear-gradient(135deg,#fb7185,#f97316)', width: 'auto', animation: 'on-fire-pulse 0.7s ease-in-out infinite' }}>
              🔥 ON FIRE x{fireStreak}
            </div>
          )}
          {explosiveChainActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#ff6b6b', width: 'auto' }}>🔥 CHAIN</div>}
          {bubbleWaveActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#0ea5e9', width: 'auto' }}>🌊 WAVE</div>}
          {jackpotActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#a78bfa', width: 'auto' }}>💎 JACKPOT</div>}
          {precisionFocusActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#fbbf24', width: 'auto' }}>🎯 FOCUS</div>}
          {tornadoActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#10b981', width: 'auto' }}>🌪 TORNADO</div>}
          {reflectShieldActive && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#8b5cf6', width: 'auto' }}>🛡 REFLECT</div>}
          {overdrive > 1 && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#ec4899', width: 'auto' }}>⚡ x{overdrive}</div>}
          {homingBalloonsCount > 0 && <div style={{ ...levelBadge, fontSize: 11, padding: '4px 8px', background: '#fbbf24', width: 'auto' }}>📍 x{homingBalloonsCount}</div>}
        </div>

        {/* Combo badge hidden - now shown as floating indicator at balloon */}

        {comboFlash && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: GAME_H / 2 - 60,
              textAlign: 'center',
              fontFamily: "'Bungee Inline', cursive",
              fontSize: 58,
              color: '#fff59d',
              textShadow: '0 4px 0 rgba(0,0,0,0.35), 0 0 18px rgba(255,245,157,0.8)',
              animation: 'combo-flash 0.65s ease-out forwards',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {comboFlash}
          </div>
        )}

        {flashFx.text && performance.now() - flashFx.ts < 900 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: GAME_H / 2 - 110,
              textAlign: 'center',
              fontFamily: "'Titan One', cursive",
              fontSize: 30,
              color: flashFx.color,
              textShadow: '0 3px 0 rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.55)',
              animation: 'flash-text 0.9s ease-out forwards',
              zIndex: 18,
            }}
          >
            {flashFx.text}
          </div>
        )}

        <div
          style={{ position: 'absolute', inset: 0, zIndex: 6, touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
          onPointerDown={handleTapBoard}
          role="button"
          tabIndex={-1}
        >
          {balloons.map((b) => {
            const wobble = b.vx * 22 + Math.sin(performance.now() / b.wobbleFreq + b.phase) * b.wobbleAmp * 0.35;
            const stringSway = Math.round(clamp(b.stringSway || 0, -24, 24));
            const justSpawned = !b.gracingAt && (performance.now() - b.bornAt < 260);
            const skinFilter = BALLOON_SKINS.find((s) => s.id === save.activeSkin)?.filter;
            const typeKind = BALLOON_TYPES[b.type]?.kind || 'normal';
            const allowSkin = b.type !== 'bomb' && !String(typeKind).startsWith('powerup');
            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h + 20,
                  transform: `rotate(${wobble}deg)`,
                  transformOrigin: '50% 95%',
                  pointerEvents: 'none',
                  color: (BALLOON_TYPES[b.type]?.color || '#fff'),
                }}
              >
                <div style={{
                  transformOrigin: '50% 60%',
                  filter: allowSkin && skinFilter ? skinFilter : 'none',
                  animation: [
                    justSpawned ? 'balloon-spawn 0.24s cubic-bezier(0.175,0.885,0.32,1.275) forwards' : null,
                    b.type.startsWith('powerup') ? 'powerup-glow 1.4s ease-in-out infinite' : null,
                    b.gracingAt ? 'last-chance-pulse 0.25s ease-in-out infinite alternate' : null,
                  ].filter(Boolean).join(', ') || undefined,
                }}>
                  <BalloonSVG balloon={b} popFx={b.popFx} stringSway={stringSway} colorAssist={colorAssist} />
                </div>
              </div>
            );
          })}

          {particles.map((p) => (
            <PopBurst key={p.id} particle={p} />
          ))}

          {shockwaves.map((s) => (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: s.x - s.size / 2,
                top: s.y - s.size / 2,
                width: s.size,
                height: s.size,
                borderRadius: '50%',
                border: `4px solid ${s.color}`,
                animation: `shockwave ${batterySaver ? 0.45 : 0.6}s ease-out forwards`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {monkeyFalls.map((m) => (
            <div
              key={m.id}
              style={{
                position: 'absolute',
                left: m.x,
                top: m.y,
                width: 58,
                height: 102,
                transform: `translate(-50%, -50%) rotate(${m.wobble}deg)`,
                transformOrigin: '50% 10%',
                animation: 'monkey-fall-spazz 1.12s cubic-bezier(0.2, 0.72, 0.24, 1) forwards',
                pointerEvents: 'none',
                zIndex: 14,
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 21 }}>🎈</div>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: -1,
                  top: 20,
                  width: 2,
                  height: 40,
                  background: 'rgba(95,70,34,0.85)',
                  borderRadius: 99,
                  transform: `rotate(${m.sway}deg)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  marginLeft: -13,
                  bottom: 6,
                  fontSize: 27,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                  animation: 'monkey-spazz 0.17s steps(2, end) infinite',
                }}
              >
                🐒
              </div>
            </div>
          ))}

          {birdBursts.map((b) => (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y,
                transform: 'translate(-50%, -50%)',
                animation: 'bird-burst 0.95s cubic-bezier(0.18, 0.74, 0.22, 1) forwards',
                '--tx': `${b.dx}px`,
                '--ty': `${b.dy}px`,
                '--rot': `${b.rot}deg`,
                pointerEvents: 'none',
                zIndex: 14,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 17,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  animation: 'bird-flap 0.2s steps(2, end) infinite',
                }}
              >
                {b.emoji}
              </span>
            </div>
          ))}

          {shieldZaps.map((z) => (
            <div
              key={z.id}
              style={{
                position: 'absolute',
                left: z.x - 20,
                top: z.y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '2px solid rgba(165,243,252,0.95)',
                boxShadow: '0 0 16px rgba(34,211,238,0.95)',
                animation: 'shield-zap 0.32s ease-out forwards',
              }}
            />
          ))}

          {floatingScores.map((f) => (
            <div
              key={f.id}
              style={{
                position: 'absolute',
                left: f.x,
                top: f.y,
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Lilita One', cursive",
                color: f.color,
                fontSize: f.big ? 21 : 19,
                textShadow: '0 2px 0 rgba(0,0,0,0.36), 0 0 9px rgba(255,255,255,0.4)',
                animation: `float-up-fade ${f.big ? 1.35 : 0.9}s ease-out forwards`,
                pointerEvents: 'none',
                zIndex: 15,
              }}
            >
              {f.text}
            </div>
          ))}

          {floatingCombos.map((c) => (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: c.x,
                top: c.y,
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Bungee Inline', cursive",
                color: '#ffd93d',
                fontSize: 18,
                fontWeight: 'bold',
                textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 0 14px rgba(255,217,61,0.9)',
                animation: 'float-up-fade 1s ease-out forwards',
                pointerEvents: 'none',
                zIndex: 16,
              }}
            >
              {c.combo}
            </div>
          ))}
        </div>

        {paused && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              backdropFilter: 'blur(5px)',
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ ...hud, width: 300, textAlign: 'center' }}>
              <h2 style={screenTitle}>Paused</h2>
              <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
                <button style={bigBtn('#4D96FF', '#87d1ff')} onClick={() => setPaused(false)}>Resume</button>
                <button
                  style={bigBtn('#FF9F43', '#ffd278')}
                  onClick={() => {
                    endedRef.current = true;
                    onResult({ retry: true });
                  }}
                >
                  Retry
                </button>
                <button style={bigBtn('#7c3aed', '#c084fc')} onClick={onQuit}>Quit</button>
              </div>
            </div>
          </div>
        )}

        {showTutorial && (
          <TutorialOverlay
            onDone={() => {
              setShowTutorial(false);
              showTutorialRef.current = false;
              const merged = { ...save, tutorialSeen: true };
              writeSave(merged);
              setSave(merged);
            }}
          />
        )}
      </div>
    </div>
  );
}

function getNextLevel(level) {
  if (!level) return null;
  const next = ALL_LEVELS.find((l) => l.worldIdx === level.worldIdx && l.levelIdx === level.levelIdx + 1);
  return next || null;
}

function BalloonPopAdventure() {
  const [save, setSave] = useState(() => loadSave());
  const [route, setRoute] = useState({ name: 'home' });

  useEffect(() => {
    const today = getDailyDate();
    const needsRefresh =
      save.dailyDate !== today ||
      !Array.isArray(save.dailyChallenges) ||
      save.dailyChallenges.length !== 3;
    if (!needsRefresh) return;
    const next = {
      ...save,
      dailyDate: today,
      dailyChallenges: generateDailyChallenges(today),
      dailyProgress: {},
    };
    writeSave(next);
    setSave(next);
  }, [save]);

  const goWorld = useCallback(
    (worldIdx) => {
      const seen = save.introsSeen?.[String(worldIdx)];
      if (!seen) {
        setRoute({ name: 'world-intro', worldIdx });
      } else {
        setRoute({ name: 'level-select', worldIdx });
      }
    },
    [save.introsSeen],
  );

  const beginCampaignLevel = useCallback((level) => {
    setRoute({ name: 'campaign-play', level });
  }, []);

  const onCampaignResult = useCallback(
    (level, result) => {
      if (result.retry) {
        setRoute({ name: 'campaign-play', level });
        return;
      }
      if (result.passed) {
        setRoute({ name: 'level-complete', level, result });
      } else {
        setRoute({ name: 'level-failed', level, result });
      }
    },
    [],
  );

  const content = (() => {
    if (route.name === 'home') {
      return (
        <HomeScreen
          save={save}
          onStartCampaign={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'world-select' });
          }}
          onStartSurvival={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'survival-play' });
          }}
          onStartZen={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'zen-play' });
          }}
          onSettings={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'settings' });
          }}
          onCredits={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'credits' });
          }}
          onAchievements={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'achievements' });
          }}
          onDailyChallenges={() => {
            haptic('button', save.settings.haptics);
            setRoute({ name: 'daily-challenges' });
          }}
        />
      );
    }

    if (route.name === 'settings') return <SettingsScreen save={save} setSave={setSave} onBack={() => setRoute({ name: 'home' })} />;
    if (route.name === 'credits') return <CreditsScreen onBack={() => setRoute({ name: 'home' })} />;
    if (route.name === 'achievements') return <AchievementsScreen save={save} onBack={() => setRoute({ name: 'home' })} />;
    if (route.name === 'daily-challenges') return <DailyChallengesScreen save={save} onBack={() => setRoute({ name: 'home' })} />;

    if (route.name === 'world-select') {
      return (
        <WorldSelectScreen
          save={save}
          onBack={() => setRoute({ name: 'home' })}
          onPickWorld={(worldIdx) => {
            haptic('button', save.settings.haptics);
            goWorld(worldIdx);
          }}
        />
      );
    }

    if (route.name === 'world-intro') {
      return (
        <WorldIntroScreen
          worldIdx={route.worldIdx}
          onContinue={() => {
            const merged = {
              ...save,
              introsSeen: { ...save.introsSeen, [String(route.worldIdx)]: true },
            };
            writeSave(merged);
            setSave(merged);
            setRoute({ name: 'level-select', worldIdx: route.worldIdx });
          }}
        />
      );
    }

    if (route.name === 'level-select') {
      return (
        <LevelSelectScreen
          worldIdx={route.worldIdx}
          save={save}
          onBack={() => setRoute({ name: 'world-select' })}
          onPickLevel={(lvl) => {
            haptic('button', save.settings.haptics);
            beginCampaignLevel(lvl);
          }}
        />
      );
    }

    if (route.name === 'campaign-play') {
      return (
        <GameEngine
          mode="campaign"
          level={route.level}
          save={save}
          setSave={setSave}
          onResult={(result) => onCampaignResult(route.level, result)}
          onQuit={() => setRoute({ name: 'level-select', worldIdx: route.level.worldIdx })}
        />
      );
    }

    if (route.name === 'level-complete') {
      return (
        <LevelCompleteScreen
          level={route.level}
          result={route.result}
          onRetry={() => setRoute({ name: 'campaign-play', level: route.level })}
          onNext={() => {
            const next = getNextLevel(route.level);
            if (next) {
              setRoute({ name: 'campaign-play', level: next });
              return;
            }

            if (route.level.worldIdx < 6) {
              setRoute({
                name: 'world-transition',
                worldIdx: route.level.worldIdx + 1,
                worldName: WORLDS[route.level.worldIdx + 1]?.name || 'New World',
              });
              return;
            }

            setRoute({ name: 'victory' });
          }}
          onWorlds={() => setRoute({ name: 'world-select' })}
        />
      );
    }

    if (route.name === 'victory') {
      return <VictoryScreen onDone={() => setRoute({ name: 'home' })} />;
    }

    if (route.name === 'world-transition') {
      const world = WORLDS[route.worldIdx] || WORLDS[0];
      return (
        <WorldCompleteScreen
          worldName={route.worldName || world.name}
          palette={world.palette}
          onContinue={() => setRoute({ name: 'level-select', worldIdx: route.worldIdx })}
        />
      );
    }

    if (route.name === 'level-failed') {
      return (
        <LevelFailedScreen
          level={route.level}
          result={route.result}
          onRetry={() => setRoute({ name: 'campaign-play', level: route.level })}
          onWorlds={() => setRoute({ name: 'world-select' })}
        />
      );
    }

    if (route.name === 'survival-play') {
      return (
        <GameEngine
          mode="survival"
          save={save}
          setSave={setSave}
          onResult={(result) => setRoute({ name: 'survival-end', result })}
          onQuit={() => setRoute({ name: 'home' })}
        />
      );
    }

    if (route.name === 'survival-end') {
      return (
        <SurvivalEndScreen
          result={route.result}
          onReplay={() => setRoute({ name: 'survival-play' })}
          onHome={() => setRoute({ name: 'home' })}
        />
      );
    }

    if (route.name === 'zen-play') {
      return (
        <GameEngine
          mode="zen"
          save={save}
          setSave={setSave}
          onResult={() => setRoute({ name: 'home' })}
          onQuit={() => setRoute({ name: 'home' })}
        />
      );
    }

    return null;
  })();

  return (
    <div style={appShell}>
      <GlobalStyles />
      <div style={shell}>{content}</div>
    </div>
  );
}

const titleFont = {
  fontFamily: "'Chewy', cursive",
  fontSize: 50,
  lineHeight: 1,
  letterSpacing: 2,
  color: '#fff',
  transform: 'rotate(-2deg)',
  WebkitTextStroke: '1.4px rgba(22,32,66,0.92)',
  textShadow:
    '0 2px 0 rgba(19,27,56,0.95), 0 4px 0 rgba(19,27,56,0.82), 0 10px 22px rgba(0,0,0,0.42), 0 0 18px rgba(255,255,255,0.24)',
};

const appShell = {
  minHeight: '100svh',
  display: 'grid',
  placeItems: 'center',
  background:
    'radial-gradient(1100px 720px at 10% -160px, #ffe7d6aa 0%, transparent 46%), radial-gradient(1050px 760px at 90% -120px, #d6f4ffaa 0%, transparent 44%), linear-gradient(160deg, #d7e8ff 0%, #bfd8ff 45%, #9ec3ff 100%)',
  fontFamily: "'Baloo 2', cursive",
  padding: 12,
};

const shell = {
  width: GAME_W,
  height: GAME_H,
  position: 'relative',
  borderRadius: 32,
  overflow: 'hidden',
  border: '3px solid rgba(255,255,255,0.66)',
  boxShadow: '0 28px 70px rgba(19,24,53,0.34), 0 0 0 10px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.78), inset 0 -24px 70px rgba(9,13,28,0.14)',
};

function bigBtn(c1, c2) {
  return {
    width: 260,
    border: '3px solid rgba(255,255,255,0.55)',
    borderRadius: 24,
    padding: '14px 36px',
    fontSize: 19,
    fontFamily: "'Chewy', cursive",
    letterSpacing: 2,
    color: '#fff',
    cursor: 'pointer',
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    boxShadow:
      `0 8px 0 rgba(0,0,0,0.2), 0 14px 30px ${c1}88, inset 0 2px 0 rgba(255,255,255,0.58), inset 0 -5px 0 rgba(0,0,0,0.2)`,
    textShadow: '0 2px 0 rgba(15,23,42,0.92), 0 4px 10px rgba(0,0,0,0.3)',
    transition: 'transform 90ms ease, box-shadow 140ms ease, filter 140ms ease',
    clipPath: 'polygon(0 16%, 8% 0, 92% 0, 100% 16%, 100% 84%, 92% 100%, 8% 100%, 0 84%)',
  };
}

const smallBtn = {
  border: '2px solid rgba(255,255,255,0.52)',
  borderRadius: 16,
  padding: '10px 8px',
  fontFamily: "'Chewy', cursive",
  fontSize: 16,
  color: '#fff',
  background: 'linear-gradient(135deg, #5b8fff, #95d6ff)',
  textShadow: '0 2px 0 rgba(15,23,42,0.92), 0 3px 8px rgba(0,0,0,0.28)',
  boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 10px 18px rgba(91,143,255,0.18), inset 0 1px 0 rgba(255,255,255,0.55)',
  cursor: 'pointer',
  clipPath: 'polygon(0 14%, 10% 0, 90% 0, 100% 14%, 100% 86%, 90% 100%, 10% 100%, 0 86%)',
};

const backBtn = {
  ...smallBtn,
  minWidth: 88,
  background: 'linear-gradient(135deg, #6a8acb, #8bb7ff)',
};

const hud = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.26), rgba(255,255,255,0.08))',
  border: '2px solid rgba(255,255,255,0.5)',
  borderRadius: 24,
  padding: 10,
  backdropFilter: 'blur(12px)',
  boxShadow: '0 6px 0 rgba(0,0,0,0.15), 0 18px 28px rgba(26,39,78,0.2), inset 0 1px 0 rgba(255,255,255,0.56)',
  color: '#fff',
  textShadow: '0 2px 0 rgba(15,23,42,0.78), 0 3px 10px rgba(0,0,0,0.22)',
};

const levelBadge = {
  border: '2px solid rgba(255,255,255,0.5)',
  borderRadius: 999,
  padding: '7px 12px',
  color: '#fff',
  fontSize: 14,
  letterSpacing: 1,
  textAlign: 'center',
  fontFamily: "'Chewy', cursive",
  background: 'linear-gradient(135deg, rgba(56,55,132,0.88), rgba(14,116,144,0.88))',
  textShadow: '0 2px 0 rgba(15,23,42,0.96), 0 4px 10px rgba(0,0,0,0.24)',
  boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 10px 20px rgba(34,211,238,0.16), inset 0 1px 0 rgba(255,255,255,0.4)',
};

const pauseBtn = {
  ...smallBtn,
  minWidth: 86,
  background: 'linear-gradient(135deg, #334155, #64748b)',
  fontSize: 14,
  padding: '7px 10px',
};

const statBox = {
  border: '2px solid rgba(255,255,255,0.45)',
  borderRadius: 14,
  color: '#fff',
  background: 'linear-gradient(135deg, rgba(15,23,42,0.5), rgba(51,65,85,0.4))',
  textAlign: 'center',
  padding: '6px 4px',
  textShadow: '0 2px 0 rgba(15,23,42,0.96), 0 4px 10px rgba(0,0,0,0.24)',
  fontSize: 14,
  letterSpacing: 1,
  fontFamily: "'Chewy', cursive",
};

const settingRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#fff',
  fontSize: 20,
  textShadow: '0 2px 0 rgba(15,23,42,0.9), 0 4px 10px rgba(0,0,0,0.22)',
};

const toggleBtn = {
  border: '2px solid rgba(255,255,255,0.52)',
  borderRadius: 999,
  color: '#fff',
  width: 94,
  padding: '8px 12px',
  fontFamily: "'Chewy', cursive",
  fontSize: 16,
  letterSpacing: 1,
  boxShadow: '0 3px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
  textShadow: '0 2px 0 rgba(15,23,42,0.92), 0 4px 8px rgba(0,0,0,0.22)',
};

const uiLayer = {
  position: 'relative',
  zIndex: 4,
  height: '100%',
  width: '100%',
  background: 'linear-gradient(180deg, rgba(8,15,35,0.12) 0%, rgba(8,15,35,0.04) 18%, rgba(8,15,35,0.08) 72%, rgba(8,15,35,0.16) 100%)',
};

function screenShell(worldIdx) {
  return {
    width: GAME_W,
    height: GAME_H,
    position: 'relative',
    overflow: 'hidden',
    touchAction: 'none',
    background: `linear-gradient(180deg, ${WORLDS[worldIdx].palette.top}, ${WORLDS[worldIdx].palette.mid} 46%, ${WORLDS[worldIdx].palette.bot})`,
  };
}

const screenTitle = {
  margin: '18px 0 0',
  fontFamily: "'Chewy', cursive",
  textAlign: 'center',
  fontSize: 36,
  color: '#fff',
  letterSpacing: 2,
  WebkitTextStroke: '1px rgba(15,23,42,0.9)',
  textShadow: '0 2px 0 rgba(15,23,42,0.96), 0 4px 0 rgba(15,23,42,0.76), 0 8px 18px rgba(0,0,0,0.34)',
  transform: 'rotate(-1.2deg)',
};

const creditLine = {
  color: '#fff',
  fontFamily: "'Baloo 2', cursive",
  fontSize: 20,
  margin: '6px 0',
  textShadow: '0 2px 0 rgba(15,23,42,0.92), 0 4px 10px rgba(0,0,0,0.22)',
};

function GlobalStyles() {
  return (
    <style>{`
      /* Fonts loaded via @fontsource npm packages in main.jsx — no CDN needed */

      * { box-sizing: border-box; }
      button:active { transform: scale(0.96); }

      @keyframes float-up {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(-40px); opacity: 1; }
      }

      @keyframes pop-burst {
        0% { transform: translate(0, 0) scale(1); opacity: 0.95; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
      }

      @keyframes float-up-fade {
        0% { transform: translate(-50%, -50%); opacity: 1; }
        100% { transform: translate(-50%, -110px); opacity: 0; }
      }

      @keyframes star-pop {
        0%   { transform: scale(0) rotate(-40deg); opacity: 0; }
        55%  { transform: scale(1.45) rotate(10deg); opacity: 1; }
        75%  { transform: scale(0.88) rotate(-5deg); opacity: 1; }
        90%  { transform: scale(1.06) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes bounce-in {
        0% { transform: scale(0.6); opacity: 0; }
        70% { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes shake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-8px); }
        80% { transform: translateX(8px); }
        100% { transform: translateX(0); }
      }

      @keyframes combo-pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.05); }
      }

      @keyframes combo-flash {
        0% { transform: scale(0); opacity: 0; }
        30% { transform: scale(1.3); opacity: 1; }
        50% { transform: scale(1.6); opacity: 1; }
        100% { transform: scale(1.3); opacity: 0; }
      }

      @keyframes flash-text {
        0% { transform: scale(0.6) translateY(0); opacity: 0; }
        35% { transform: scale(1.15) translateY(0); opacity: 1; }
        100% { transform: scale(1) translateY(-42px); opacity: 0; }
      }

      @keyframes bob {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      @keyframes drift-r {
        0% { transform: translateX(-180px); }
        100% { transform: translateX(540px); }
      }

      @keyframes drift-l {
        0% { transform: translateX(520px); }
        100% { transform: translateX(-220px); }
      }

      @keyframes flicker {
        0%, 92% { opacity: 0.1; }
        93% { opacity: 0.95; }
        94% { opacity: 0.2; }
        95% { opacity: 0.8; }
        100% { opacity: 0.2; }
      }

      @keyframes pulse-slow {
        0%, 100% { transform: scale(0.9); opacity: 0.2; }
        50% { transform: scale(1.2); opacity: 0.65; }
      }

      @keyframes snow-fall {
        0% { transform: translateY(-30px) translateX(0px) rotate(0deg); opacity: 0; }
        10% { opacity: 0.9; }
        100% { transform: translateY(760px) translateX(30px) rotate(260deg); opacity: 0; }
      }

      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.7); }
        50% { opacity: 1; transform: scale(1.3); }
      }

      @keyframes shockwave {
        0% { transform: scale(0.15); opacity: 0.8; }
        100% { transform: scale(1.1); opacity: 0; }
      }

      @keyframes shield-pulse {
        0% { transform: scaleY(1); }
        100% { transform: scaleY(1.8); }
      }

      @keyframes shield-scroll {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(280%); }
      }

      @keyframes shield-badge-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }

      @keyframes powerup-glow {
        0%, 100% { filter: drop-shadow(0 0 6px #fff) drop-shadow(0 0 12px currentColor); }
        50% { filter: drop-shadow(0 0 14px #fff) drop-shadow(0 0 28px currentColor); }
      }

      @keyframes powerup-ring-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes balloon-spawn {
        0%   { transform: scale(0.35) rotate(-6deg); opacity: 0; }
        60%  { transform: scale(1.08) rotate(2deg); opacity: 1; }
        80%  { transform: scale(0.96) rotate(-1deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes last-chance-pulse {
        0%   { filter: drop-shadow(0 0 6px #ff4444) drop-shadow(0 0 14px #ff0000); }
        100% { filter: drop-shadow(0 0 14px #ff8800) drop-shadow(0 0 28px #ff4400); }
      }

      @keyframes shield-zap {
        0% { transform: scale(0.3); opacity: 0.95; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      @keyframes monkey-fall-spazz {
        0% { transform: translate(-50%, -58%) rotate(0deg) scale(0.82); opacity: 0; }
        18% { transform: translate(-50%, -52%) rotate(-10deg) scale(1); opacity: 1; }
        36% { transform: translate(-50%, -24%) rotate(8deg) scale(1); opacity: 1; }
        58% { transform: translate(-50%, 14%) rotate(-12deg) scale(0.98); opacity: 0.96; }
        78% { transform: translate(-50%, 54%) rotate(10deg) scale(0.94); opacity: 0.88; }
        100% { transform: translate(-50%, 110%) rotate(16deg) scale(0.9); opacity: 0; }
      }

      @keyframes monkey-spazz {
        0% { transform: translate(0, 0) rotate(-6deg); }
        25% { transform: translate(-1px, 1px) rotate(4deg); }
        50% { transform: translate(1px, -1px) rotate(-4deg); }
        75% { transform: translate(-1px, 0) rotate(6deg); }
        100% { transform: translate(0, 0) rotate(-6deg); }
      }

      @keyframes bird-burst {
        0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.85); opacity: 0; }
        12% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.8); opacity: 0; }
      }

      @keyframes bird-flap {
        0% { transform: translateY(0) rotate(-8deg); }
        50% { transform: translateY(-1px) rotate(8deg); }
        100% { transform: translateY(0) rotate(-8deg); }
      }

      @keyframes home-balloon-rise {
        0%   { transform: translateY(0) rotate(-4deg);    opacity: 0; }
        6%   { opacity: 0.88; }
        48%  { transform: translateY(-330px) rotate(4deg); opacity: 0.82; }
        84%  { transform: translateY(-600px) rotate(-2deg); opacity: 0.32; }
        100% { transform: translateY(-740px) rotate(1deg); opacity: 0; }
      }

      @keyframes confetti-fall {
        0% {
          transform: translate(0, 0) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--tx, 0px), 380px) rotate(720deg) scale(0.3);
          opacity: 0;
        }
      }

      @keyframes on-fire-pulse {
        0% { transform: translateY(0) scale(1); box-shadow: 0 0 0 rgba(251,113,133,0.0); }
        100% { transform: translateY(-1px) scale(1.03); box-shadow: 0 0 14px rgba(251,113,133,0.45); }
      }

      @keyframes pb-flash {
        0% { opacity: 0.95; }
        100% { opacity: 0; }
      }
    `}</style>
  );
}

export default BalloonPopAdventure;
