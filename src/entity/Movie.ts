import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './Review';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imdbId: string;

  @Column()
  title: string;

  @Column()
  posterPath: string;

  @Column()
  releaseDate: string;

  @OneToMany(() => Review, review => review.movie, { cascade: true, eager: true })
  reviews: Review[];
}
