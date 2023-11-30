import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { GameReview } from './GameReview';
import { Movie } from './Movie';

@Entity()
export class Review {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Movie, movie => movie.reviews, { eager: true })
  movie: Movie;

  @Column({ type: 'text' })
  text: string;

  @Column()
  author: string;

  @OneToMany(() => GameReview, gameReview => gameReview.review)
  gameReviews: GameReview[];
}
