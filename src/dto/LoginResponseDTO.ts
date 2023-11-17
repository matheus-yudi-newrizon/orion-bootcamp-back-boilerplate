import { Game } from '../entity/Game';
import { User } from '../entity/User';

export class LoginResponseDTO {
  id: number;
  email: string;
  token: string;
  game?: Game;

  constructor(user: User, token: string, game?: Game) {
    this.id = user.id;
    this.email = user.email;
    this.token = token;
    this.game = game;
  }
}
