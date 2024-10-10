import React from 'react';
import { GameState } from '../types';

interface MapProps {
  gameState: GameState;
  visionWidth: number;
  visionHeight: number;
}

const Map: React.FC<MapProps> = ({ gameState, visionWidth, visionHeight }) => {
  const { player, enemies, map, bullets, swords } = gameState;

  const getRelativePosition = (x: number, y: number) => {
    const relX = x - player.position.x + visionWidth / 2;
    const relY = y - player.position.y + visionHeight / 2;
    return { x: relX, y: relY };
  };

  const isInVision = (x: number, y: number) => {
    return x >= 0 && x <= visionWidth && y >= 0 && y <= visionHeight;
  };

  // Generate random trees
  const trees = React.useMemo(() => {
    const treeCount = 200;
    return Array.from({ length: treeCount }, () => ({
      x: Math.random() * map.width,
      y: Math.random() * map.height,
    }));
  }, [map.width, map.height]);

  return (
    <div className="w-full h-full bg-green-800 relative overflow-hidden">
      {/* Forest background */}
      <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: 'url("https://source.unsplash.com/1600x900/?forest,texture")', opacity: 0.3 }}></div>

      {/* Trees */}
      {trees.map((tree, index) => {
        const { x, y } = getRelativePosition(tree.x, tree.y);
        if (isInVision(x, y)) {
          return (
            <div
              key={`tree-${index}`}
              className="absolute w-6 h-6 bg-green-900 rounded-full"
              style={{ left: `${x - 3}px`, top: `${y - 3}px` }}
            >
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-green-700 absolute -top-9 left-0"></div>
            </div>
          );
        }
        return null;
      })}

      {/* Player */}
      <div
        className="absolute w-6 h-6 bg-blue-500 rounded-full"
        style={{
          left: `${visionWidth / 2 - 3}px`,
          top: `${visionHeight / 2 - 3}px`,
        }}
      >
        {/* Player direction arrow */}
        <div
          className="absolute w-4 h-1 bg-white"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(0%, -50%) rotate(${player.direction}rad)`,
            transformOrigin: 'left',
          }}
        ></div>
      </div>

      {/* Enemies */}
      {enemies.map((enemy, index) => {
        const { x, y } = getRelativePosition(enemy.position.x, enemy.position.y);
        if (isInVision(x, y)) {
          return (
            <div
              key={`enemy-${index}`}
              className="absolute w-4 h-4 bg-red-500 rounded-full"
              style={{ left: `${x - 2}px`, top: `${y - 2}px` }}
            >
              <div className="w-full h-1 bg-gray-200 absolute -top-2">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Bullets */}
      {bullets.map((bullet, index) => {
        const { x, y } = getRelativePosition(bullet.position.x, bullet.position.y);
        if (isInVision(x, y)) {
          return (
            <div
              key={`bullet-${index}`}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{ left: `${x - 1}px`, top: `${y - 1}px` }}
            ></div>
          );
        }
        return null;
      })}

      {/* Sword swings */}
      {swords.map((sword, index) => {
        const { x, y } = getRelativePosition(sword.position.x, sword.position.y);
        if (isInVision(x, y)) {
          return (
            <div
              key={`sword-${index}`}
              className="absolute w-12 h-12 border-2 border-white rounded-full"
              style={{
                left: `${x - 6}px`,
                top: `${y - 6}px`,
                transform: `rotate(${sword.direction}rad)`,
                opacity: sword.duration / 10,
              }}
            ></div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Map;