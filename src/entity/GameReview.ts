import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './Game';
import { Review } from './Review';

@Entity()
export class GameReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, game => game.gameReviews)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ManyToOne(() => Review, review => review.gameReviews, { eager: true })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column({ nullable: true })
  answer: number;

  @Column({ nullable: true })
  isCorrect: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
