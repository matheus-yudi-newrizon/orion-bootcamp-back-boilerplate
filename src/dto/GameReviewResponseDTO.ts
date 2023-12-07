import { GameReview } from '../entity';
import { GameResponseDTO } from './GameResponseDTO';
import { MovieDTO } from './MovieDTO';

export class GameReviewResponseDTO {
  isCorrect: boolean;
  game: GameResponseDTO;
  movie?: MovieDTO;

  constructor(gameReview: GameReview, game: GameResponseDTO) {
    this.isCorrect = gameReview.isCorrect;
    this.game = game;
    if (!this.isCorrect) this.movie = new MovieDTO(gameReview.review.movie);
  }
}
