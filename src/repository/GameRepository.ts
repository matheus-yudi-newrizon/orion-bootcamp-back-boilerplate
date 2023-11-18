import { Repository } from 'typeorm';
import { Game } from '../entity/Game';
import { Service } from 'typedi';

@Service()
export class GameRepository extends Repository<Game> {
  async getActiveGameByUserId(userId: number): Promise<Game | null> {
    return this.findOne({
      where: {
        user: { id: userId },
        isActive: true
      }
    });
  }
}
