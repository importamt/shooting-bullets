export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  position: Position;
  hp: number;
  maxHp: number;
  speed: number;
}

export interface Player extends Entity {
  direction: number;
  longWeapon: Weapon;
  shortWeapon: Weapon;
  lastFireTime: {
    long: number;
    short: number;
  };
}

export interface Enemy extends Entity {
  type: string;
}

export interface Weapon {
  name: string;
  damage: number;
  range: number;
  fireRate: number;
}

export interface Bullet {
  position: Position;
  direction: number;
  speed: number;
  range: number;
  damage: number;
}

export interface Sword {
  position: Position;
  direction: number;
  duration: number;
  damage: number;
  range: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  map: {
    width: number;
    height: number;
  };
  stage: number;
  remainingEnemies: number;
  bullets: Bullet[];
  swords: Sword[];
}