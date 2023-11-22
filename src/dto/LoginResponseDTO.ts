import { GameResponseDTO } from './GameResponseDTO';

export class LoginResponseDTO {
  token: string;
  game: GameResponseDTO;

  constructor(token: string, game: GameResponseDTO) {
    this.token = token;
    this.game = game;
  }
}
