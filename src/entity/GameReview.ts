import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Game } from './Game';
import { Review } from './Review';

@Entity()
export class GameReview {
  @PrimaryColumn({ name: 'gameId' })
  @ManyToOne(() => Game, game => game.id)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @PrimaryColumn({ name: 'reviewId' })
  @ManyToOne(() => Review, review => review.id)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column()
  answer: string;

  @Column()
  isCorrect: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
