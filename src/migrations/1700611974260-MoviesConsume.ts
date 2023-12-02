import * as fs from 'fs/promises';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { Movie } from '../entity';

export class MoviesConsume1700611974260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const data: string = await fs.readFile('/app/movies.json', 'utf-8');
    const movies: Movie[] = JSON.parse(data);

    await queryRunner.manager.save('Movie', movies);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
