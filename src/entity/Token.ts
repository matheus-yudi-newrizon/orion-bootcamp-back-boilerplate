import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity()
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
