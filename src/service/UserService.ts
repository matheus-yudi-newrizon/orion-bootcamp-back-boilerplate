import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { User } from '../entity/User';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = MysqlDataSource.getRepository(User);
  }

  async createUser(email: string, password: string): Promise<User> {
    const usuario = new User();
    usuario.email = email;
    usuario.password = password;

    return this.userRepository.save(usuario);
  }
}
