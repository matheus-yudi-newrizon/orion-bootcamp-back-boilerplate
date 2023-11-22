import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './Review';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imdb_id: string;

  @Column()
  title: string;

  @Column()
  poster_path: string;

  @Column()
  release_date: string;

  @OneToMany(() => Review, review => review.movie, { cascade: true, eager: true })
  reviews: Review[];
}
