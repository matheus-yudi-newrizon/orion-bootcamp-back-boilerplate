import { GameResponseDTO } from './GameResponseDTO';

export class LoginResponseDTO {
  accessToken: string;
  game: GameResponseDTO;

  constructor(accessToken: string, game: GameResponseDTO) {
    this.accessToken = accessToken;
    this.game = game;
  }
}
