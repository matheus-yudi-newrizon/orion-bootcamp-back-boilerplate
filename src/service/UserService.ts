import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { User } from '../entity/User';

export class UserService {
  private static userRepository: Repository<User> = MysqlDataSource.getRepository(User);

  public static async createUser(email: string, password: string): Promise<User> {
    const usuario = new User();
    usuario.email = email;
    usuario.password = password;

    return this.userRepository.save(usuario);
  }
}
