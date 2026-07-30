/**
 * Projectile and effect rendering and updates
 */

import { distance } from '../utils/math.js';
import { isoFromPx } from '../config.js';

/**
 * Update projectiles - move them toward target
 */
export function updateProjectiles(G, dt) {
  const toRemove = [];

  for (let i = 0; i < G.projectiles.length; i++) {
    const p = G.projectiles[i];

    // Move projectile toward target
    const dx = p.tx - p.px;
    const dy = p.ty - p.py;
    const dist = Math.hypot(dx, dy);

    if (dist < p.speed * dt) {
      // Hit target
      const target = G.zombies[p.targetId];
      if (target && target.hp > 0) {
        target.hp -= p.dmg;
        if (target.hp <= 0) {
          // Zombie killed
        }
      }
      toRemove.push(i);
    } else {
      // Move toward target
      const spd = p.speed * dt / Math.max(1, dist);
      p.px += dx * spd;
      p.py += dy * spd;
    }
  }

  // Remove dead projectiles (in reverse to maintain indices)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    G.projectiles.splice(toRemove[i], 1);
  }
}

/**
 * Draw all projectiles
 */
export function drawProjectiles(ctx, G) {
  for (const p of G.projectiles) {
    const { sx, sy } = isoFromPx(p.px, p.py);

    ctx.fillStyle = p.color || '#ffcc44';
    ctx.beginPath();
    ctx.arc(sx, sy, p.size || 2, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.shadowColor = p.color || '#ffcc44';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/**
 * Add visual effect
 */
export function addEffect(G, effect) {
  effect.startTime = effect.startTime || Date.now();
  G.effects.push(effect);
}

/**
 * Update effects (fade out)
 */
export function updateEffects(G, dt) {
  const currentTime = Date.now();
  const toRemove = [];

  for (let i = 0; i < G.effects.length; i++) {
    const e = G.effects[i];
    const elapsed = (currentTime - e.startTime) / 1000;

    if (elapsed > (e.life || 0.5)) {
      toRemove.push(i);
    }
  }

  for (let i = toRemove.length - 1; i >= 0; i--) {
    G.effects.splice(toRemove[i], 1);
  }
}

/**
 * Draw all effects
 */
export function drawEffects(ctx, G) {
  const currentTime = Date.now();

  for (const e of G.effects) {
    const elapsed = (currentTime - e.startTime) / 1000;
    const progress = elapsed / (e.life || 0.5);
    const alpha = Math.max(0, 1 - progress);

    ctx.globalAlpha = alpha * (e.alpha || 0.6);

    if (e.type === 'explosion') {
      const { sx, sy } = isoFromPx(e.px, e.py);
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(sx, sy, e.radius * progress, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'chain') {
      const { sx: sx1, sy: sy1 } = isoFromPx(e.x1, e.y1);
      const { sx: sx2, sy: sy2 } = isoFromPx(e.x2, e.y2);

      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2 + progress * 2;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}
