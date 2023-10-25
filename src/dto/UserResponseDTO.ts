import { User } from '../entity/User';

export class UserResponseDTO {
  private id: number;
  private email: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }
}
