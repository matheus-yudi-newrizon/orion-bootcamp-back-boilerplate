import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Review } from './Review';
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
  ended: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Review)
  @JoinTable()
  reviews: Review[];
}
