import * as fs from 'fs/promises';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { Movie } from '../entity/Movie';

export class MoviesConsume1700611974260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dados: string = await fs.readFile('/app/movies.json', 'utf-8');
    const dadosFormatados: Movie[] = JSON.parse(dados);

    await queryRunner.manager.save('Movie', dadosFormatados);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
