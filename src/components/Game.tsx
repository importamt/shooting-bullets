import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Position, Player, Enemy, Weapon, Bullet, Sword } from '../types';
import Map from './Map';
import HUD from './HUD';

const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const VISION_WIDTH = 500;
const VISION_HEIGHT = 500;

const initialGameState: GameState = {
  player: {
    position: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    hp: 100,
    maxHp: 100,
    speed: 2,
    direction: 0,
    longWeapon: { name: 'Pistol', damage: 20, range: 200, fireRate: 1000 },
    shortWeapon: { name: 'Dagger', damage: 0.75, range: 50, fireRate: 1000 },
    lastFireTime: { long: 0, short: 0 },
  },
  enemies: [],
  map: { width: MAP_WIDTH, height: MAP_HEIGHT },
  stage: 1,
  remainingEnemies: 30,
  bullets: [],
  swords: [],
};

const createEnemy = (position: Position): Enemy => ({
  position,
  hp: 50,
  maxHp: 50,
  speed: 0.5,
  type: 'basic',
});

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const state = { ...initialGameState };
    for (let i = 0; i < state.remainingEnemies; i++) {
      const position = {
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
      };
      state.enemies.push(createEnemy(position));
    }
    return state;
  });
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setPressedKeys((prevKeys) => new Set(prevKeys).add(e.key.toLowerCase()));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys((prevKeys) => {
      const newKeys = new Set(prevKeys);
      newKeys.delete(e.key.toLowerCase());
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGameState = useCallback(() => {
    setGameState((prevState) => {
      const newState = { ...prevState };
      const { player } = newState;

      // 플레이어 이동
      let dx = 0;
      let dy = 0;
      if (pressedKeys.has('arrowup') || pressedKeys.has('w')) dy -= 1;
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) dy += 1;
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) dx -= 1;
      if (pressedKeys.has('arrowright') || pressedKeys.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * player.speed;
        dy = (dy / length) * player.speed;

        player.position.x = Math.max(0, Math.min(MAP_WIDTH, player.position.x + dx));
        player.position.y = Math.max(0, Math.min(MAP_HEIGHT, player.position.y + dy));
        player.direction = Math.atan2(dy, dx);
      }

      // 발사 처리
      const now = Date.now();
      if (pressedKeys.has('z') && now - player.lastFireTime.long >= player.longWeapon.fireRate) {
        newState.bullets.push({
          position: { ...player.position },
          direction: player.direction,
          speed: 5,
          range: player.longWeapon.range,
          damage: player.longWeapon.damage,
        });
        player.lastFireTime.long = now;
      }

      if (pressedKeys.has('x') && now - player.lastFireTime.short >= player.shortWeapon.fireRate) {
        newState.swords.push({
          position: { ...player.position },
          direction: player.direction,
          duration: 10,
          damage: player.shortWeapon.damage,
          range: player.shortWeapon.range,
        });
        player.lastFireTime.short = now;
      }

      // 총알 이동 및 적 충돌 처리
      newState.bullets = newState.bullets.filter((bullet) => {
        bullet.position.x += Math.cos(bullet.direction) * bullet.speed;
        bullet.position.y += Math.sin(bullet.direction) * bullet.speed;
        bullet.range -= bullet.speed;

        // 적과의 충돌 체크
        newState.enemies.forEach((enemy) => {
          const dx = bullet.position.x - enemy.position.x;
          const dy = bullet.position.y - enemy.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 10) {
            enemy.hp -= bullet.damage;
            // 넉백 (수정된 부분)
            const knockbackDistance = bullet.damage * 0.5;
            enemy.position.x += Math.cos(bullet.direction) * knockbackDistance;
            enemy.position.y += Math.sin(bullet.direction) * knockbackDistance;
            bullet.range = 0; // 총알 제거
          }
        });

        return bullet.range > 0;
      });

      // 칼 공격 지속 시간 및 적 충돌 처리
      newState.swords = newState.swords.filter((sword) => {
        sword.duration -= 1;

        // 적과의 충돌 체크
        newState.enemies.forEach((enemy) => {
          const dx = sword.position.x - enemy.position.x;
          const dy = sword.position.y - enemy.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < sword.range) {
            enemy.hp -= sword.damage;
            // 넉백 (수정된 부분)
            const knockbackDistance = sword.damage * 0.5;
            enemy.position.x += Math.cos(sword.direction) * knockbackDistance;
            enemy.position.y += Math.sin(sword.direction) * knockbackDistance;
          }
        });

        return sword.duration > 0;
      });

      // 적 이동 및 충돌 처리
      newState.enemies = newState.enemies.filter((enemy) => {
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          enemy.position.x += (dx / distance) * enemy.speed;
          enemy.position.y += (dy / distance) * enemy.speed;
        }

        // 플레이어와 적 충돌 체크
        if (distance < 20) {
          player.hp = Math.max(0, player.hp - 10);
          const knockbackDistance = 15;
          const knockbackDirection = Math.atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x);
          player.position.x += Math.cos(knockbackDirection) * knockbackDistance;
          player.position.y += Math.sin(knockbackDirection) * knockbackDistance;
          player.position.x = Math.max(0, Math.min(MAP_WIDTH, player.position.x));
          player.position.y = Math.max(0, Math.min(MAP_HEIGHT, player.position.y));
        }

        return enemy.hp > 0;
      });

      newState.remainingEnemies = newState.enemies.length;

      return newState;
    });
  }, [pressedKeys]);

  useEffect(() => {
    const gameLoop = setInterval(updateGameState, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [updateGameState]);

  return (
    <div className="w-[500px] h-[600px] bg-gray-800 flex flex-col">
      <Map gameState={gameState} visionWidth={VISION_WIDTH} visionHeight={VISION_HEIGHT} />
      <HUD gameState={gameState} />
    </div>
  );
};

export default Game;