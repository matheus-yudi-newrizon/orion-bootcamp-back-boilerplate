import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Review } from './Review';

@Entity()
export class Movie {
  @PrimaryColumn()
  id: number;

  @Column()
  imdbId: string;

  @Column()
  title: string;

  @Column()
  posterPath: string;

  @Column()
  releaseDate: string;

  @OneToMany(() => Review, review => review.movie, { cascade: true, eager: true })
  reviews: Review[];
}
