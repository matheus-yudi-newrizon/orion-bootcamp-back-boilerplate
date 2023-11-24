import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GameReview } from './GameReview';
import { User } from './User';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.games)
  user: User;

  @Column()
  lives: number;

  @Column()
  score: number;

  @Column()
  combo: number;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GameReview, gameReview => gameReview.game)
  gameReviews: GameReview[];
}
