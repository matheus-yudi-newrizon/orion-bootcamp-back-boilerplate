import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './Review';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imdbId: number;

  @Column()
  title: string;

  @Column()
  posterPath: string;

  @Column()
  releaseDate: Date;

  @OneToMany(() => Review, review => review.movie)
  reviews: Review[];
}
