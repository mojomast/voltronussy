/**
 * Example Web Game
 *
 * A simple collectible game demonstrating the Voltronussy engine.
 */

import { WorldImpl, SchedulerImpl } from '@voltronussy/engine-core';
import { WebCanvasAdapter, CanvasContextResource, InputStateResource } from '@voltronussy/adapter-webcanvas';
import type { System, World, EntityId, InputState } from '@voltronussy/engine-abstractions';

// =============================================================================
// Game Constants
// =============================================================================

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 24;
const COLLECTIBLE_SIZE = 16;
const ENEMY_SIZE = 20;
const PLAYER_SPEED = 250;
const ENEMY_SPEED = 80;

// =============================================================================
// Components
// =============================================================================

class Position {
  constructor(public x: number = 0, public y: number = 0) {}
}

class Velocity {
  constructor(public dx: number = 0, public dy: number = 0) {}
}

class Size {
  constructor(public width: number = 32, public height: number = 32) {}
}

class Renderable {
  constructor(public color: string = '#fff') {}
}

// Tag components (no data, just markers)
const PlayerTag = Symbol('Player');
const CollectibleTag = Symbol('Collectible');
const EnemyTag = Symbol('Enemy');

// =============================================================================
// Resources
// =============================================================================

const GameStateResource = Symbol('GameState');

interface GameState {
  score: number;
  gameOver: boolean;
}

// =============================================================================
// Systems
// =============================================================================

const InputSystem: System = {
  name: 'Input',
  priority: -10,

  update(world: World, _dt: number) {
    const input = world.getResource<InputState>(InputStateResource);
    const gameState = world.getResource<GameState>(GameStateResource);
    if (!input || gameState?.gameOver) return;

    const players = world.query({ with: [PlayerTag, Velocity] });
    for (const player of players) {
      const vel = world.getComponent(player, Velocity)!;

      vel.dx = 0;
      vel.dy = 0;

      if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) vel.dx = -PLAYER_SPEED;
      if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) vel.dx = PLAYER_SPEED;
      if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) vel.dy = -PLAYER_SPEED;
      if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) vel.dy = PLAYER_SPEED;
    }
  },
};

const EnemyAISystem: System = {
  name: 'EnemyAI',
  priority: -5,

  update(world: World, _dt: number) {
    const gameState = world.getResource<GameState>(GameStateResource);
    if (gameState?.gameOver) return;

    // Find player position
    const players = world.query({ with: [PlayerTag, Position] });
    const playerEntity = players.toArray()[0];
    if (!playerEntity) return;

    const playerPos = world.getComponent(playerEntity, Position)!;

    // Move enemies toward player
    const enemies = world.query({ with: [EnemyTag, Position, Velocity] });
    for (const enemy of enemies) {
      const pos = world.getComponent(enemy, Position)!;
      const vel = world.getComponent(enemy, Velocity)!;

      const dx = playerPos.x - pos.x;
      const dy = playerPos.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        vel.dx = (dx / dist) * ENEMY_SPEED;
        vel.dy = (dy / dist) * ENEMY_SPEED;
      }
    }
  },
};

const MovementSystem: System = {
  name: 'Movement',
  priority: 0,

  fixedUpdate(world: World, dt: number) {
    const entities = world.query({ with: [Position, Velocity] });

    for (const entity of entities) {
      const pos = world.getComponent(entity, Position)!;
      const vel = world.getComponent(entity, Velocity)!;

      pos.x += vel.dx * dt;
      pos.y += vel.dy * dt;
    }
  },
};

const BoundsSystem: System = {
  name: 'Bounds',
  priority: 5,

  update(world: World, _dt: number) {
    const entities = world.query({ with: [Position, Size] });

    for (const entity of entities) {
      const pos = world.getComponent(entity, Position)!;
      const size = world.getComponent(entity, Size)!;

      const halfW = size.width / 2;
      const halfH = size.height / 2;

      pos.x = Math.max(halfW, Math.min(GAME_WIDTH - halfW, pos.x));
      pos.y = Math.max(halfH, Math.min(GAME_HEIGHT - halfH, pos.y));
    }
  },
};

const CollisionSystem: System = {
  name: 'Collision',
  priority: 10,

  update(world: World, _dt: number) {
    const gameState = world.getResource<GameState>(GameStateResource);
    if (!gameState || gameState.gameOver) return;

    // Get player
    const players = world.query({ with: [PlayerTag, Position, Size] });
    const playerEntity = players.toArray()[0];
    if (!playerEntity) return;

    const playerPos = world.getComponent(playerEntity, Position)!;
    const playerSize = world.getComponent(playerEntity, Size)!;

    // Check collectibles
    const collectibles = world.query({ with: [CollectibleTag, Position, Size] });
    for (const collectible of collectibles) {
      const pos = world.getComponent(collectible, Position)!;
      const size = world.getComponent(collectible, Size)!;

      if (aabbCollision(playerPos, playerSize, pos, size)) {
        // Collected! Respawn at random position
        pos.x = Math.random() * (GAME_WIDTH - 100) + 50;
        pos.y = Math.random() * (GAME_HEIGHT - 100) + 50;
        gameState.score += 10;
        updateScoreDisplay(gameState.score);
      }
    }

    // Check enemies
    const enemies = world.query({ with: [EnemyTag, Position, Size] });
    for (const enemy of enemies) {
      const pos = world.getComponent(enemy, Position)!;
      const size = world.getComponent(enemy, Size)!;

      if (aabbCollision(playerPos, playerSize, pos, size)) {
        gameState.gameOver = true;
        console.log('Game Over! Final score:', gameState.score);
      }
    }
  },
};

function aabbCollision(
  posA: Position,
  sizeA: Size,
  posB: Position,
  sizeB: Size
): boolean {
  const halfAW = sizeA.width / 2;
  const halfAH = sizeA.height / 2;
  const halfBW = sizeB.width / 2;
  const halfBH = sizeB.height / 2;

  return (
    posA.x - halfAW < posB.x + halfBW &&
    posA.x + halfAW > posB.x - halfBW &&
    posA.y - halfAH < posB.y + halfBH &&
    posA.y + halfAH > posB.y - halfBH
  );
}

const RenderSystem: System = {
  name: 'Render',
  priority: 100,

  render(world: World, _dt: number) {
    const ctx = world.getResource<CanvasRenderingContext2D>(CanvasContextResource);
    const gameState = world.getResource<GameState>(GameStateResource);
    if (!ctx) return;

    const entities = world.query({ with: [Position, Size, Renderable] });

    for (const entity of entities) {
      const pos = world.getComponent(entity, Position)!;
      const size = world.getComponent(entity, Size)!;
      const render = world.getComponent(entity, Renderable)!;

      ctx.fillStyle = render.color;
      ctx.fillRect(
        pos.x - size.width / 2,
        pos.y - size.height / 2,
        size.width,
        size.height
      );
    }

    // Draw game over text
    if (gameState?.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

      ctx.fillStyle = '#fff';
      ctx.font = '24px system-ui';
      ctx.fillText(`Score: ${gameState.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

      ctx.font = '16px system-ui';
      ctx.fillStyle = '#888';
      ctx.fillText('Refresh to play again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
    }
  },
};

// =============================================================================
// UI Helpers
// =============================================================================

function updateScoreDisplay(score: number) {
  const el = document.getElementById('score');
  if (el) el.textContent = `Score: ${score}`;
}

// =============================================================================
// Game Setup
// =============================================================================

function setupGame(world: World) {
  // Initialize game state
  world.setResource(GameStateResource, { score: 0, gameOver: false });

  // Create player
  const player = world.spawn();
  world.addComponent(player, PlayerTag, {});
  world.addComponent(player, Position, new Position(GAME_WIDTH / 2, GAME_HEIGHT / 2));
  world.addComponent(player, Velocity, new Velocity(0, 0));
  world.addComponent(player, Size, new Size(PLAYER_SIZE, PLAYER_SIZE));
  world.addComponent(player, Renderable, new Renderable('#00ff88'));

  // Create collectibles
  for (let i = 0; i < 5; i++) {
    const collectible = world.spawn();
    world.addComponent(collectible, CollectibleTag, {});
    world.addComponent(
      collectible,
      Position,
      new Position(
        Math.random() * (GAME_WIDTH - 100) + 50,
        Math.random() * (GAME_HEIGHT - 100) + 50
      )
    );
    world.addComponent(collectible, Size, new Size(COLLECTIBLE_SIZE, COLLECTIBLE_SIZE));
    world.addComponent(collectible, Renderable, new Renderable('#ffd700'));
  }

  // Create enemies
  for (let i = 0; i < 3; i++) {
    const enemy = world.spawn();
    world.addComponent(enemy, EnemyTag, {});
    world.addComponent(
      enemy,
      Position,
      new Position(
        Math.random() < 0.5 ? 50 : GAME_WIDTH - 50,
        Math.random() * GAME_HEIGHT
      )
    );
    world.addComponent(enemy, Velocity, new Velocity(0, 0));
    world.addComponent(enemy, Size, new Size(ENEMY_SIZE, ENEMY_SIZE));
    world.addComponent(enemy, Renderable, new Renderable('#ff4444'));
  }
}

// =============================================================================
// Main
// =============================================================================

function main() {
  const world = new WorldImpl();
  const scheduler = new SchedulerImpl({ fixedTimestep: 1 / 60 });

  // Add systems
  scheduler.addSystem(InputSystem);
  scheduler.addSystem(EnemyAISystem);
  scheduler.addSystem(MovementSystem);
  scheduler.addSystem(BoundsSystem);
  scheduler.addSystem(CollisionSystem);
  scheduler.addSystem(RenderSystem);

  // Create adapter
  const adapter = new WebCanvasAdapter({
    canvas: '#game-canvas',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
  });

  // Initialize
  adapter.init(world);
  setupGame(world);

  // Start!
  adapter.start(scheduler, world);
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
