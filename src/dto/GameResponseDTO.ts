import { Game } from '../entity/Game';

export class GameResponseDTO {
  lives: number;
  score: number;
  combo: number;
  isActive: boolean;

  constructor(game: Game) {
    this.lives = game.lives;
    this.score = game.score;
    this.combo = game.combo;
    this.isActive = game.isActive;
  }
}
