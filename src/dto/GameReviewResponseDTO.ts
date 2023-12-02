import { GameReview } from '../entity';
import { GameResponseDTO } from './GameResponseDTO';

export class GameReviewResponseDTO {
  isCorrect: boolean;
  game: GameResponseDTO;

  constructor(gameReview: GameReview, game: GameResponseDTO) {
    this.isCorrect = gameReview.isCorrect;
    this.game = game;
  }
}
