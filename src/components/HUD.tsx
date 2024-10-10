import React from 'react';
import { GameState } from '../types';
import { Heart, Swords, Target } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
}

const HUD: React.FC<HUDProps> = ({ gameState }) => {
  const { player, remainingEnemies, stage } = gameState;

  return (
    <div className="w-[500px] bg-gray-700 p-4 text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-red-500 mr-2" />
          <div className="w-32 h-4 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center">
          <Swords className="w-6 h-6 text-yellow-500 mr-2" />
          <span>{player.longWeapon.name} / {player.shortWeapon.name}</span>
        </div>
        <div className="flex items-center">
          <Target className="w-6 h-6 text-green-500 mr-2" />
          <span>Enemies: {remainingEnemies}</span>
        </div>
        <div>Stage: {stage}</div>
      </div>
    </div>
  );
};

export default HUD;