import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Movie } from './Movie';

@Entity()
export class Review {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Movie, movie => movie.reviews)
  movie: Movie;

  @Column({ type: 'text' })
  text: string;
}
