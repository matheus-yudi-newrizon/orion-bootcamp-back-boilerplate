import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GameReview } from './GameReview';
import { Movie } from './Movie';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, movie => movie.reviews)
  movie: Movie;

  @Column()
  title: string;

  @Column()
  text: string;

  @OneToMany(() => GameReview, gameReview => gameReview.review)
  gameReviews: GameReview[];
}
