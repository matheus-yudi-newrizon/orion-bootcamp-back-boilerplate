import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['token'])
export class Token {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'id' })
  user: User;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}
