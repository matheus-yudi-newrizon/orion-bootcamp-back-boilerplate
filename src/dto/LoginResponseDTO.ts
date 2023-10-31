import { User } from '../entity/User';

export class LoginResponseDTO {
  id: number;
  email: string;
  token: string;

  constructor(user: User, token: string) {
    this.id = user.id;
    this.email = user.email;
    this.token = token;
  }
}
