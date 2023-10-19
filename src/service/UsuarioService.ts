import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Usuario } from '../entity/Usuario';

export class UsuarioService {
  private usuarioRepository: Repository<Usuario>;

  constructor() {
    this.usuarioRepository = MysqlDataSource.getRepository(Usuario);
  }

  async criarUsuario(email: string, password: string): Promise<Usuario> {
    const usuario = new Usuario();
    usuario.email = email;
    usuario.password = password;

    return this.usuarioRepository.save(usuario);
  }
}
