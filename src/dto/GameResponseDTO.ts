import { Game } from '../entity/Game';

export class GameResponseDTO {
  id: number;
  lives: number;
  score: number;
  combo: number;
  isActive: boolean;

  constructor(game: Game) {
    this.id = game.id;
    this.lives = game.lives;
    this.score = game.score;
    this.combo = game.combo;
    this.isActive = game.isActive;
  }
}
